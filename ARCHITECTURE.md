# Lecture Summarizer - Architecture

## Overview

This application uses a microservices architecture with clear separation of concerns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│  Node.js API    │────▶│   PostgreSQL    │
│   (React/Vite)  │     │   (Express)     │     │    Database     │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
         ┌─────────────────┐       ┌─────────────────┐
         │   Python        │       │   Google        │
         │   Whisper       │       │   Gemini API    │
         │   Service       │       │                 │
         │  (Transcription)│       │ (Summarization) │
         └─────────────────┘       └─────────────────┘
```

## Services

### 1. Frontend (React + Vite)
- **Port**: 5173
- **Purpose**: User interface for uploading recordings, viewing transcripts, and summaries
- **Tech**: React, TypeScript, TailwindCSS, Zustand

### 2. Node.js Backend (Express)
- **Port**: 5000
- **Purpose**: Main API server, orchestrates all operations
- **Responsibilities**:
  - User authentication (JWT)
  - File upload handling
  - Database operations (Prisma + PostgreSQL)
  - Coordinates transcription and summarization
  - Serves API endpoints

### 3. Python Transcription Service (FastAPI + Whisper)
- **Port**: 8000
- **Purpose**: Local audio transcription using OpenAI Whisper
- **Features**:
  - Speech-to-text using Whisper (base model by default)
  - Optional speaker diarization using pyannote.audio
  - CPU-optimized (no GPU required)
  - Handles long audio files (up to 2 hours)

### 4. Google Gemini API
- **Purpose**: AI-powered text analysis
- **Used for**:
  - Summarization
  - Key points extraction
  - Action items extraction
  - Study notes generation

## Data Flow

### Audio Processing Pipeline

1. **Upload**: User uploads audio file via frontend
2. **Storage**: Node.js saves file to disk
3. **Transcription**: Node.js calls Python Whisper service
4. **Store Transcript**: Node.js saves transcript to database
5. **Summarization**: Node.js sends transcript text to Gemini
6. **Store Summary**: Node.js saves summary to database
7. **Response**: Frontend displays results

```
User Upload → Node.js → Python Whisper → Transcript
                                              ↓
                                         Gemini API
                                              ↓
                                          Summary
```

## Why This Architecture?

### Transcription (Whisper - Local)
- **Free**: No API costs for transcription
- **Private**: Audio never leaves your server
- **Reliable**: No rate limits or API quotas
- **Accurate**: Whisper is state-of-the-art for speech recognition

### Summarization (Gemini - API)
- **Intelligent**: LLMs excel at text understanding and summarization
- **Flexible**: Can generate various outputs (summaries, key points, Q&A)
- **Cost-effective**: Text-only API calls are cheap
- **Fast**: No local compute needed for text processing

## Setup Instructions

### 1. Python Transcription Service

```bash
cd transcription-service
./setup.sh
# Edit .env if needed
source venv/bin/activate
python main.py
```

### 2. Node.js Backend

```bash
cd backend
npm install
# Edit .env with your settings
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### Run All Services

```bash
# Terminal 1: Transcription service
cd transcription-service && source venv/bin/activate && python main.py

# Terminal 2: Backend + Frontend
npm run dev
```

## Environment Variables

### Backend (.env)
```
TRANSCRIPTION_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your-key  # For summarization only
DATABASE_URL=postgresql://...
```

### Transcription Service (.env)
```
WHISPER_MODEL=base  # tiny, base, small, medium, large
DEVICE=cpu
ENABLE_DIARIZATION=false
HF_TOKEN=  # Required if diarization enabled
```

## API Endpoints

### Node.js Backend (port 5000)
- `POST /api/recordings` - Upload audio
- `GET /api/recordings/:id` - Get recording details
- `GET /api/recordings/:id/status` - Get processing status

### Python Transcription Service (port 8000)
- `GET /health` - Health check
- `POST /transcribe` - Transcribe uploaded file
- `POST /transcribe-path` - Transcribe file from path

## Scaling Considerations

- **Transcription**: CPU-bound, can be scaled horizontally
- **Summarization**: API-bound, limited by Gemini quotas
- **Database**: Standard PostgreSQL scaling applies
- **Storage**: Consider S3/cloud storage for production
