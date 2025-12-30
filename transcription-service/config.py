"""
Configuration for the transcription service.
All settings can be overridden via environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Whisper model configuration
# Options: "tiny", "base", "small", "medium", "large"
# "base" is default - good balance of speed/accuracy for CPU
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")

# Device configuration (cpu or cuda)
DEVICE = os.getenv("DEVICE", "cpu")

# Speaker diarization settings
ENABLE_DIARIZATION = os.getenv("ENABLE_DIARIZATION", "false").lower() == "true"

# HuggingFace token for pyannote (required for diarization)
# Get from: https://huggingface.co/settings/tokens
HF_TOKEN = os.getenv("HF_TOKEN", "")

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Temp directory for processing
TEMP_DIR = os.getenv("TEMP_DIR", "/tmp/transcription")

# Max audio duration in seconds (2 hours default)
MAX_DURATION_SECONDS = int(os.getenv("MAX_DURATION_SECONDS", "7200"))
