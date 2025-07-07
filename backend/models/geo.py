from uagents import Model, Field

class GeolocationRequest(Model):
    address: str = Field(
        description="Physical address (location)", 
    )

class GeolocationResponse(Model):
    latitude: float
    longitude: float
