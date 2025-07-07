from typing import List
from models.chat import MultimodalChatMessage
from db.supabase_client import supabase


async def get_current_chat(user_id: str) -> List[MultimodalChatMessage]:
    """
    Retrieve the current chat for a user from the user_messages table.

    Args:
        user_id: The UUID of the user

    Returns:
        List of MultimodalChatMessage objects sorted by timestamp
    """
    try:
        # Query the user_messages table for the user's chat
        response = (supabase.table("user_messages")
                    .select("chat")
                    .eq("user_id", user_id)
                    .order("created_at", desc=True)
                    .limit(1)
                    .execute())

        if not response.data:
            # No chat found for this user, return empty list
            return []

        # Extract the chat array from the response
        chat_data = response.data[0]["chat"]

        if not chat_data:
            return []

        # Convert the JSON objects to MultimodalChatMessage objects
        chat_messages = []
        for msg_data in chat_data:
            chat_message = MultimodalChatMessage(
                role=msg_data.get("role", "user"),
                text=msg_data.get("text", ""),
                image_base64=msg_data.get("image_base64"),
                timestamp=msg_data.get("timestamp", 0.0)
            )
            chat_messages.append(chat_message)

        # Sort by timestamp to ensure proper order
        chat_messages.sort(key=lambda x: x.timestamp)

        return chat_messages

    except Exception as e:
        print(f"Error retrieving chat for user {user_id}: {str(e)}")
        return []


async def save_chat_to_db(user_id: str, chat_messages: List[MultimodalChatMessage]) -> bool:
    """
    Save or update the user's chat in the user_messages table.

    Args:
        user_id: The UUID of the user
        chat_messages: List of MultimodalChatMessage objects to save

    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Convert chat messages to JSON format
        chat_data = []
        for msg in chat_messages:
            chat_data.append({
                "role": msg.role,
                "text": msg.text,
                "image_base64": msg.image_base64,
                "timestamp": msg.timestamp
            })
         # Check if user already has a chat record
        existing_response = (supabase.table("user_messages")
                             .select("id")
                             .eq("user_id", user_id)
                             .execute())

        if existing_response.data:
            # Update existing record
            supabase.table("user_messages").update(
                {"chat": chat_data}).eq("user_id", user_id).execute()
        else:
            # Insert new record
            supabase.table("user_messages").insert(
                {"user_id": user_id, "chat": chat_data}).execute()

        return True

    except Exception as e:
        print(f"Error saving chat for user {user_id}: {str(e)}")
        return False


async def send_to_ai_model(chat_messages: List[MultimodalChatMessage]) -> MultimodalChatMessage:
    """
    Send chat messages to AI model and get response.
    This is a placeholder implementation.

    Args:
        chat_messages: List of MultimodalChatMessage objects

    Returns:
        MultimodalChatMessage: AI response message
    """
    # TODO: Implement actual AI model integration
    import time
    ai_response = MultimodalChatMessage(
        role="assistant",
        text="Hello! I'm a fashion AI assistant. How can I help you today?",
        image_base64=None,
        timestamp=time.time()
    )
    return ai_response
