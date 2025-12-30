"""
Core transcription module using OpenAI Whisper.
Handles audio transcription with optional speaker diarization.
"""
import logging
import os
from typing import Optional
import whisper
import torch

import config

logger = logging.getLogger(__name__)

# Global model instance (loaded once)
_whisper_model = None
_diarization_pipeline = None


def get_whisper_model():
    """
    Lazy-load Whisper model. Keeps model in memory for subsequent requests.
    """
    global _whisper_model
    if _whisper_model is None:
        logger.info(f"Loading Whisper model: {config.WHISPER_MODEL} on {config.DEVICE}")
        _whisper_model = whisper.load_model(config.WHISPER_MODEL, device=config.DEVICE)
        logger.info("Whisper model loaded successfully")
    return _whisper_model


def get_diarization_pipeline():
    """
    Lazy-load pyannote diarization pipeline.
    Requires HuggingFace token with access to pyannote models.
    """
    global _diarization_pipeline
    if _diarization_pipeline is None:
        if not config.HF_TOKEN:
            raise ValueError("HF_TOKEN required for speaker diarization. Get one from https://huggingface.co/settings/tokens")
        
        logger.info("Loading pyannote diarization pipeline...")
        from pyannote.audio import Pipeline
        _diarization_pipeline = Pipeline.from_pretrained(
            "pyannote/speaker-diarization-3.1",
            use_auth_token=config.HF_TOKEN
        )
        # Move to CPU explicitly
        _diarization_pipeline.to(torch.device(config.DEVICE))
        logger.info("Diarization pipeline loaded successfully")
    return _diarization_pipeline


def transcribe_audio(
    audio_path: str,
    enable_diarization: Optional[bool] = None,
    language: Optional[str] = None
) -> dict:
    """
    Transcribe audio file using Whisper, optionally with speaker diarization.
    
    Args:
        audio_path: Path to the audio file
        enable_diarization: Override config setting for diarization
        language: Force specific language (auto-detect if None)
    
    Returns:
        dict with transcription results in standardized format
    """
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    # Determine if diarization should be used
    use_diarization = enable_diarization if enable_diarization is not None else config.ENABLE_DIARIZATION
    
    logger.info(f"Starting transcription: {audio_path} (diarization: {use_diarization})")
    
    # Load model and transcribe
    model = get_whisper_model()
    
    # Whisper transcription options
    transcribe_options = {
        "verbose": False,
        "word_timestamps": True,  # Needed for segment alignment
    }
    if language:
        transcribe_options["language"] = language
    
    # Run Whisper transcription
    result = model.transcribe(audio_path, **transcribe_options)
    
    detected_language = result.get("language", "en")
    full_text = result.get("text", "").strip()
    
    # Calculate duration from segments
    segments = result.get("segments", [])
    duration = segments[-1]["end"] if segments else 0
    
    # If diarization is disabled, return simple format
    if not use_diarization:
        return {
            "language": detected_language,
            "duration": round(duration, 2),
            "text": full_text
        }
    
    # Run speaker diarization
    try:
        diarized_segments = _run_diarization(audio_path, segments)
        return {
            "language": detected_language,
            "duration": round(duration, 2),
            "segments": diarized_segments,
            "text": full_text
        }
    except Exception as e:
        logger.error(f"Diarization failed, returning plain transcript: {e}")
        # Fallback to plain transcript if diarization fails
        return {
            "language": detected_language,
            "duration": round(duration, 2),
            "text": full_text,
            "diarization_error": str(e)
        }


def _run_diarization(audio_path: str, whisper_segments: list) -> list:
    """
    Run speaker diarization and merge with Whisper segments.
    
    Args:
        audio_path: Path to audio file
        whisper_segments: Segments from Whisper transcription
    
    Returns:
        List of segments with speaker labels
    """
    logger.info("Running speaker diarization...")
    
    pipeline = get_diarization_pipeline()
    diarization = pipeline(audio_path)
    
    # Build speaker timeline
    speaker_timeline = []
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        speaker_timeline.append({
            "start": turn.start,
            "end": turn.end,
            "speaker": speaker
        })
    
    # Merge Whisper segments with speaker labels
    diarized_segments = []
    speaker_map = {}  # Map pyannote speaker IDs to "Speaker A", "Speaker B", etc.
    speaker_counter = 0
    
    for seg in whisper_segments:
        seg_start = seg["start"]
        seg_end = seg["end"]
        seg_text = seg["text"].strip()
        
        if not seg_text:
            continue
        
        # Find the speaker for this segment (majority overlap)
        speaker = _find_speaker_for_segment(seg_start, seg_end, speaker_timeline)
        
        # Map to friendly speaker name
        if speaker not in speaker_map:
            speaker_map[speaker] = f"Speaker {chr(65 + speaker_counter)}"  # A, B, C...
            speaker_counter += 1
        
        diarized_segments.append({
            "speaker": speaker_map[speaker],
            "start": round(seg_start, 2),
            "end": round(seg_end, 2),
            "text": seg_text
        })
    
    logger.info(f"Diarization complete: {len(diarized_segments)} segments, {len(speaker_map)} speakers")
    return diarized_segments


def _find_speaker_for_segment(seg_start: float, seg_end: float, speaker_timeline: list) -> str:
    """
    Find the speaker with the most overlap for a given segment.
    """
    max_overlap = 0
    best_speaker = "Unknown"
    
    for turn in speaker_timeline:
        # Calculate overlap
        overlap_start = max(seg_start, turn["start"])
        overlap_end = min(seg_end, turn["end"])
        overlap = max(0, overlap_end - overlap_start)
        
        if overlap > max_overlap:
            max_overlap = overlap
            best_speaker = turn["speaker"]
    
    return best_speaker
