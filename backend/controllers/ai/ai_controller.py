from models.chat import MultimodalChatRequest, MultimodalChatResponse, MultimodalChatMessage
from services.chat_service import get_current_chat, save_chat_to_db, send_to_ai_model
from typing import List


async def append_and_process_chat(request: MultimodalChatRequest) -> MultimodalChatResponse:
    """
    1. Get user's current chat from the database,
    2. Add new message from the request,
    3. Send it to the AI model,
    4. Process the response
    4.1. If the response has a start job flag, start RAP MLLM and Agentverse job sequentially
    4.2. Else, return the AI response directly.
    """
    user_id = request.user_id
    current_chat = await get_current_chat(user_id)
    current_chat.append(request.message)

    ai_response = await send_to_ai_model(current_chat)
    current_chat.append(ai_response)

    # Placeholder for job handling logic

    await save_chat_to_db(user_id, current_chat)

    return MultimodalChatResponse(messages=current_chat)
