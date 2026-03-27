from emergentintegrations.llm.openai import OpenAISpeechToText
import os
from typing import Optional
import httpx

class VoiceService:
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        self.stt = OpenAISpeechToText(api_key=self.api_key)
    
    async def transcribe_audio(self, audio_file, language: str = "en") -> str:
        """
        Transcribe audio file to text
        
        Args:
            audio_file: Audio file object (from FastAPI UploadFile)
            language: Language code (en, hi for Hindi)
        
        Returns:
            Transcribed text
        """
        try:
            response = await self.stt.transcribe(
                file=audio_file.file,
                model="whisper-1",
                language=language if language in ["en", "hi"] else None,
                response_format="json"
            )
            return response.text
        except Exception as e:
            raise Exception(f"Transcription failed: {str(e)}")
    
    async def text_to_speech(self, text: str, voice: str = "alloy", language: str = "en") -> bytes:
        """
        Convert text to speech using OpenAI TTS
        
        Args:
            text: Text to convert to speech
            voice: Voice to use (alloy, echo, fable, onyx, nova, shimmer)
            language: Language preference
        
        Returns:
            Audio bytes
        """
        try:
            # OpenAI TTS API endpoint
            url = "https://api.openai.com/v1/audio/speech"
            
            # Prepare headers
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            # Prepare request data
            data = {
                "model": "tts-1",
                "input": text,
                "voice": voice
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=data, headers=headers, timeout=30.0)
                response.raise_for_status()
                return response.content
                
        except Exception as e:
            raise Exception(f"Text-to-speech failed: {str(e)}")

# Create singleton instance
voice_service = VoiceService()
