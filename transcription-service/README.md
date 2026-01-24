# Transcription Service

Local audio transcription service using OpenAI Whisper with optional speaker diarization.

## Features

- **Whisper Transcription**: Uses OpenAI's Whisper model for accurate speech-to-text
- **Speaker Diarization**: Optional speaker identification using pyannote.audio
- **CPU Optimized**: Runs on CPU without GPU requirements
- **REST API**: FastAPI-based service for easy integration

## Quick Start

### 1) Install dependencies

```bash
cd transcription-service
python -m venv venv
source venv/bin/activate        # Linux/Mac
# or: venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### 2) Configure Whisper and diarization

```bash
cp .env.example .env
$EDITOR .env
```

Key settings (all in .env):

- WHISPER_MODEL: tiny | base | small | medium | large. Use `base` for CPU balance, `small` for higher quality, `tiny` for speed, `large` for best accuracy (much slower, heavy RAM).
- DEVICE: cpu | cuda. Set `cuda` if you have GPU + drivers; otherwise keep `cpu`.
- ENABLE_DIARIZATION: true | false. Turn on to label speakers. Requires pyannote weights and token.
- HF_TOKEN: HuggingFace token required when diarization is enabled (https://huggingface.co/settings/tokens; accept pyannote model terms).
- PORT/HOST: defaults 8000/0.0.0.0.

### 3) Run the service

```bash
python main.py
# or with uvicorn explicitly
uvicorn main:app --host 0.0.0.0 --port 8000
```

Service listens at http://localhost:8000

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

| Variable           | Default | Description                                       |
| ------------------ | ------- | ------------------------------------------------- |
| WHISPER_MODEL      | base    | Whisper model size (tiny/base/small/medium/large) |
| DEVICE             | cpu     | Device to use (cpu/cuda)                          |
| ENABLE_DIARIZATION | false   | Enable speaker diarization by default             |
| HF_TOKEN           |         | HuggingFace token (required for diarization)      |
| HOST               | 0.0.0.0 | Server host                                       |
| PORT               | 8000    | Server port                                       |

## Speaker Diarization Setup

To enable speaker diarization:

1. Create a HuggingFace account: https://huggingface.co
2. Accept pyannote model terms: https://huggingface.co/pyannote/speaker-diarization-3.1
3. Create a token: https://huggingface.co/settings/tokens
4. Set `HF_TOKEN=<token>` and `ENABLE_DIARIZATION=true` in `.env`
5. Ensure `pyannote.audio>=3.1.0` is installed (included in requirements). If you turned diarization off earlier to avoid the install, re-run `pip install -r requirements.txt`.

Notes:

- Diarization uses CPU by default; set DEVICE=cuda to run on GPU.
- If diarization fails, the service still returns the transcript with segments but without speaker labels.

## Whisper model guidance

- `tiny`: fastest, lowest quality; good for quick tests.
- `base` (default): balanced for CPU usage; good general quality.
- `small`: better accuracy; slower, more RAM.
- `medium`: higher accuracy; slower still.
- `large`: best quality; heavy CPU/GPU and RAM (skip unless you have resources).

Change the model by editing `WHISPER_MODEL` in `.env`; no other code changes required.

## Docker

```bash
docker build -t transcription-service .
docker run -p 8000:8000 -e WHISPER_MODEL=base transcription-service
```
