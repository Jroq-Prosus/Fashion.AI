from services.voice_service import recognize_speech_from_audio

def handle_voice_to_text(audio_bytes: bytes) -> dict:
    text = recognize_speech_from_audio(audio_bytes)
    return {"transcript": text}
