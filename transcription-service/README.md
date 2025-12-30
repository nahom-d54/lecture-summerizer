# Transcription Service

Local audio transcription service using OpenAI Whisper with optional speaker diarization.

## Features

- **Whisper Transcription**: Uses OpenAI's Whisper model for accurate speech-to-text
- **Speaker Diarization**: Optional speaker identification using pyannote.audio
- **CPU Optimized**: Runs on CPU without GPU requirements
- **REST API**: FastAPI-based service for easy integration

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env as needed
```

### 3. Run the Service

```bash
python main.py
```

The service will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Transcribe Uploaded File
```
POST /transcribe
Content-Type: multipart/form-data

file: <audio file>
enable_diarization: true/false (optional)
language: en/es/fr/etc (optional, auto-detect if not provided)
```

### Transcribe from Path
```
POST /transcribe-path
Content-Type: application/json

{
  "audio_path": "/path/to/audio.mp3",
  "enable_diarization": false,
  "language": null
}
```

## Response Format

### Without Diarization
```json
{
  "success": true,
  "language": "en",
  "duration": 3600.5,
  "text": "Full transcript text here..."
}
```

### With Diarization
```json
{
  "success": true,
  "language": "en",
  "duration": 3600.5,
  "text": "Full transcript text here...",
  "segments": [
    {
      "speaker": "Speaker A",
      "start": 0.0,
      "end": 12.4,
      "text": "Good morning everyone"
    },
    {
      "speaker": "Speaker B",
      "start": 12.5,
      "end": 16.8,
      "text": "Sir, can you repeat that?"
    }
  ]
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| WHISPER_MODEL | base | Whisper model size (tiny/base/small/medium/large) |
| DEVICE | cpu | Device to use (cpu/cuda) |
| ENABLE_DIARIZATION | false | Enable speaker diarization by default |
| HF_TOKEN | | HuggingFace token (required for diarization) |
| HOST | 0.0.0.0 | Server host |
| PORT | 8000 | Server port |

## Speaker Diarization Setup

To enable speaker diarization:

1. Create a HuggingFace account at https://huggingface.co
2. Get an access token from https://huggingface.co/settings/tokens
3. Accept the pyannote model terms at https://huggingface.co/pyannote/speaker-diarization-3.1
4. Set `HF_TOKEN` in your `.env` file
5. Set `ENABLE_DIARIZATION=true`

## Docker

```bash
docker build -t transcription-service .
docker run -p 8000:8000 -e WHISPER_MODEL=base transcription-service
```
