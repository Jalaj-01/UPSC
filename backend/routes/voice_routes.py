from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from services import voice_service
import io

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/transcribe", response_model=dict)
async def transcribe_audio(audio: UploadFile = File(...), language: str = "en"):
    """Transcribe audio to text"""
    try:
        # Validate file type
        allowed_types = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a']
        if audio.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid audio format. Allowed: {', '.join(allowed_types)}"
            )
        
        # Transcribe
        text = await voice_service.transcribe_audio(audio, language)
        
        return {
            "success": True,
            "text": text,
            "language": language
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/text-to-speech")
async def text_to_speech(request: dict):
    """Convert text to speech"""
    try:
        text = request.get('text')
        voice = request.get('voice', 'alloy')  # alloy, echo, fable, onyx, nova, shimmer
        language = request.get('language', 'en')
        
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        
        # Generate audio
        audio_bytes = await voice_service.text_to_speech(text, voice, language)
        
        # Return as streaming response
        return StreamingResponse(
            io.BytesIO(audio_bytes),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices", response_model=dict)
async def get_available_voices():
    """Get list of available TTS voices"""
    return {
        "success": True,
        "voices": [
            {"id": "alloy", "name": "Alloy", "description": "Neutral voice"},
            {"id": "echo", "name": "Echo", "description": "Male voice"},
            {"id": "fable", "name": "Fable", "description": "Expressive voice"},
            {"id": "onyx", "name": "Onyx", "description": "Deep male voice"},
            {"id": "nova", "name": "Nova", "description": "Female voice"},
            {"id": "shimmer", "name": "Shimmer", "description": "Soft female voice"}
        ]
    }