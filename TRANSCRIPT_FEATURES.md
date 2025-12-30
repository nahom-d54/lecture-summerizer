# Transcript Features

## Current Implementation

### ✅ Timestamps
- Each segment shows when it was spoken (MM:SS format)
- Segments are automatically split by Whisper based on natural pauses

### ✅ Improved UI
- Hover effects on segments
- Better spacing and readability
- Monospace font for timestamps
- Speaker count display (when available)

## Speaker Diarization (Optional)

To enable speaker identification (Speaker A, Speaker B, etc.):

### Requirements
- ~2GB additional disk space for pyannote models
- HuggingFace account and token

### Setup Steps

1. **Install pyannote.audio**
   ```bash
   cd transcription-service
   pip install pyannote.audio>=3.1.0
   ```

2. **Get HuggingFace Token**
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with read access
   - Accept terms at https://huggingface.co/pyannote/speaker-diarization-3.1

3. **Configure Environment**
   Create `transcription-service/.env`:
   ```env
   ENABLE_DIARIZATION=true
   HF_TOKEN=your_huggingface_token_here
   ```

4. **Restart Python Service**
   ```bash
   cd transcription-service
   python main.py
   ```

### How It Works

When diarization is enabled:
- Whisper transcribes the audio
- Pyannote identifies different speakers
- Segments are labeled as "Speaker A", "Speaker B", etc.
- Each speaker gets a different color badge in the UI

### Without Diarization

- Transcripts still show timestamps
- No speaker labels (all segments appear without badges)
- Much faster processing
- No additional disk space needed

## Example Output

### With Diarization:
```
0:00  [Speaker A] Hello everyone, welcome to today's meeting.
0:05  [Speaker B] Thanks for having me. Let's discuss the project.
0:12  [Speaker A] Sure, let's start with the timeline.
```

### Without Diarization:
```
0:00  Hello everyone, welcome to today's meeting.
0:05  Thanks for having me. Let's discuss the project.
0:12  Sure, let's start with the timeline.
```

Both formats are useful - diarization adds context but isn't always necessary.
