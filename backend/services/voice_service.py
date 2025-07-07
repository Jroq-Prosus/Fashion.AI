from groq import Groq
from io import BytesIO

# Initialize Groq client
client = Groq()

def recognize_speech_from_audio(audio_bytes: bytes) -> str:
    # Convert audio bytes to a file-like object
    audio_file = BytesIO(audio_bytes)
    audio_file.name = "audio.wav"  # Groq expects file-like object with name

    try:
        # Call Groq Whisper API for transcription
        transcription = client.audio.transcriptions.create(
            file=audio_file,  # Required: audio file-like object
            model="whisper-large-v3-turbo",  # Whisper model
            response_format="verbose_json",  # To include more details
            language="en",  # Optional: auto-detect if not provided
            temperature=0.0  # Optional: deterministic
        )
        # Return only the transcript text
        return transcription['text']

    except Exception as e:
        raise RuntimeError(f"Groq speech-to-text error: {e}")
