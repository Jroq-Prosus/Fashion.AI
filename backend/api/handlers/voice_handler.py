from fastapi import APIRouter, UploadFile, File, HTTPException, status
from utils.response import standard_response
from controllers.ai.voice_controller import handle_voice_to_text

router = APIRouter()

ALLOWED_AUDIO_TYPES = ["audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "video/mp4"]
MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/voice-to-text", status_code=status.HTTP_200_OK)
async def voice_to_text(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=400, detail="Invalid audio file type")
    
    contents = await file.read()
    if len(contents) > MAX_AUDIO_SIZE:
        raise HTTPException(status_code=413, detail="Audio file size exceeds 5 MB limit")

    result = handle_voice_to_text(contents)

    return standard_response(
        code=status.HTTP_200_OK,
        message="Successfully converted voice to text",
        data=result
    )
