import os
from enum import Enum

from uagents import Agent, Context, Model
from uagents.experimental.quota import QuotaProtocol, RateLimit
from uagents_core.models import ErrorMessage

from chat_proto import chat_proto, struct_output_client_proto
from coordinates import find_coordinates, GeolocationResponse, GeolocationRequest

AGENT_SEED = os.getenv("AGENT_SEED", "google-geolocation-agent")
AGENT_NAME = os.getenv("AGENT_NAME", "Google API Geolocation Agent")


PORT = 8000
agent = Agent(
    name=AGENT_NAME,
    seed=AGENT_SEED,
    port=PORT,
    endpoint=f"http://localhost:{PORT}/submit",
)


proto = QuotaProtocol(
    storage_reference=agent.storage,
    name="Geolocation-Protocol",
    version="0.1.0",
    default_rate_limit=RateLimit(window_size_minutes=60, max_requests=6),
)


@proto.on_message(GeolocationRequest, replies={GeolocationResponse, ErrorMessage})
async def handle_request(ctx: Context, sender: str, msg: GeolocationRequest):
    ctx.logger.info(f"Received Address resolution request: {msg.address}")
    cache = ctx.storage.get(msg.address) or None
    if cache:
        await ctx.send(sender, GeolocationResponse(**cache))
        return

    try:
        coordinates = await find_coordinates(msg.address)
    except Exception as err:
        ctx.logger.error(err)
        await ctx.send(sender, ErrorMessage(error=str(err)))
        return

    if "error" in coordinates:
        await ctx.send(sender, ErrorMessage(error=coordinates["error"]))
        return

    await ctx.send(sender, GeolocationResponse(**coordinates))
    ctx.storage.set(msg.address, coordinates)


@proto.on_query(model=GeolocationRequest, replies={GeolocationResponse, ErrorMessage})
async def handle_query(ctx: Context, sender: str, msg: GeolocationRequest):
    ctx.logger.info(f"Received Address resolution query: {msg.address}")
    cache = ctx.storage.get(msg.address) or None
    if cache:
        await ctx.send(sender, GeolocationResponse(**cache))
        return

    try:
        coordinates = await find_coordinates(msg.address)
    except Exception as err:
        ctx.logger.error(err)
        await ctx.send(sender, ErrorMessage(error=str(err)))
        return

    if "error" in coordinates:
        await ctx.send(sender, ErrorMessage(error=coordinates["error"]))
        return

    await ctx.send(sender, GeolocationResponse(**coordinates))
    ctx.storage.set(msg.address, coordinates)


agent.include(proto, publish_manifest=True)
agent.include(chat_proto, publish_manifest=True)
agent.include(struct_output_client_proto, publish_manifest=True)


### Health check related code
def agent_is_healthy() -> bool:
    """
    Implement the actual health check logic here.

    For example, check if the agent can connect to a third party API,
    check if the agent has enough resources, etc.
    """
    condition = True  # TODO: logic here
    return bool(condition)


class HealthCheck(Model):
    pass


class HealthStatus(str, Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"


class AgentHealth(Model):
    agent_name: str
    status: HealthStatus


health_protocol = QuotaProtocol(
    storage_reference=agent.storage, name="HealthProtocol", version="0.1.0"
)


@health_protocol.on_message(HealthCheck, replies={AgentHealth})
async def handle_health_check(ctx: Context, sender: str, msg: HealthCheck):
    status = HealthStatus.UNHEALTHY
    try:
        if agent_is_healthy():
            status = HealthStatus.HEALTHY
    except Exception as err:
        ctx.logger.error(err)
    finally:
        await ctx.send(sender, AgentHealth(agent_name=AGENT_NAME, status=status))


agent.include(health_protocol, publish_manifest=True)


if __name__ == "__main__":
    agent.run()