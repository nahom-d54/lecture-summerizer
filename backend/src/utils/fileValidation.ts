export const ALLOWED_AUDIO_FORMATS = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/x-m4a',
  'audio/mp4',
  'audio/webm',
];

export const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500MB

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFileFormat = (mimetype: string): FileValidationResult => {
  if (ALLOWED_AUDIO_FORMATS.includes(mimetype)) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: `Invalid file format. Allowed formats: ${ALLOWED_AUDIO_FORMATS.join(', ')}`,
  };
};

export const validateFileSize = (size: number): FileValidationResult => {
  if (size <= MAX_FILE_SIZE_BYTES) {
    return { isValid: true };
  }
  return {
    isValid: false,
    error: `File size exceeds the limit of 500MB`,
  };
};
