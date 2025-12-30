"""
FastAPI server for the transcription service.
Provides REST API for audio transcription using Whisper.
"""
import logging
import os
import shutil
import tempfile
import uuid
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from pydantic import BaseModel

import config
from transcriber import transcribe_audio, get_whisper_model

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Transcription Service",
    description="Audio transcription using OpenAI Whisper with optional speaker diarization",
    version="1.0.0"
)


class TranscriptionRequest(BaseModel):
    """Request body for transcription from file path."""
    audio_path: str
    enable_diarization: Optional[bool] = None
    language: Optional[str] = None


class TranscriptionResponse(BaseModel):
    """Response model for transcription results."""
    success: bool
    language: Optional[str] = None
    duration: Optional[float] = None
    text: Optional[str] = None
    segments: Optional[list] = None
    error: Optional[str] = None


@app.on_event("startup")
async def startup_event():
    """Pre-load Whisper model on startup for faster first request."""
    logger.info("Starting transcription service...")
    logger.info(f"Configuration: model={config.WHISPER_MODEL}, device={config.DEVICE}, diarization={config.ENABLE_DIARIZATION}")
    
    # Create temp directory
    os.makedirs(config.TEMP_DIR, exist_ok=True)
    
    # Pre-load Whisper model
    try:
        get_whisper_model()
        logger.info("Transcription service ready")
    except Exception as e:
        logger.error(f"Failed to load Whisper model: {e}")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "ok",
        "model": config.WHISPER_MODEL,
        "device": config.DEVICE,
        "diarization_enabled": config.ENABLE_DIARIZATION
    }


@app.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_endpoint(
    file: UploadFile = File(...),
    enable_diarization: Optional[bool] = Form(None),
    language: Optional[str] = Form(None)
):
    """
    Transcribe an uploaded audio file.
    
    - **file**: Audio file (mp3, wav, m4a, etc.)
    - **enable_diarization**: Override default diarization setting
    - **language**: Force specific language (auto-detect if not provided)
    """
    temp_path = None
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Save uploaded file to temp location
        file_ext = os.path.splitext(file.filename)[1] or ".mp3"
        temp_path = os.path.join(config.TEMP_DIR, f"{uuid.uuid4()}{file_ext}")
        
        with open(temp_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        logger.info(f"Processing uploaded file: {file.filename} -> {temp_path}")
        
        # Run transcription
        result = transcribe_audio(
            audio_path=temp_path,
            enable_diarization=enable_diarization,
            language=language
        )
        
        return TranscriptionResponse(
            success=True,
            language=result.get("language"),
            duration=result.get("duration"),
            text=result.get("text"),
            segments=result.get("segments")
        )
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return TranscriptionResponse(
            success=False,
            error=str(e)
        )
    finally:
        # Cleanup temp file
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/transcribe-path", response_model=TranscriptionResponse)
async def transcribe_path_endpoint(request: TranscriptionRequest):
    """
    Transcribe an audio file from a local path.
    Used by Node.js backend to transcribe already-uploaded files.
    
    - **audio_path**: Path to the audio file on disk
    - **enable_diarization**: Override default diarization setting
    - **language**: Force specific language (auto-detect if not provided)
    """
    try:
        result = transcribe_audio(
            audio_path=request.audio_path,
            enable_diarization=request.enable_diarization,
            language=request.language
        )
        
        return TranscriptionResponse(
            success=True,
            language=result.get("language"),
            duration=result.get("duration"),
            text=result.get("text"),
            segments=result.get("segments")
        )
        
    except FileNotFoundError as e:
        logger.error(f"File not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        return TranscriptionResponse(
            success=False,
            error=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=False,  # Disable reload in production
        workers=1  # Single worker to avoid loading model multiple times
    )
