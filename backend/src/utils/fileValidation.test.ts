import * as fc from 'fast-check';
import {
  ALLOWED_AUDIO_FORMATS,
  MAX_FILE_SIZE_BYTES,
  validateFileFormat,
  validateFileSize,
} from './fileValidation';

describe('File Validation Properties', () => {
  test('Property 1: File format validation', () => {
    fc.assert(
      fc.property(fc.string(), mimetype => {
        const result = validateFileFormat(mimetype);
        if (ALLOWED_AUDIO_FORMATS.includes(mimetype)) {
          return result.isValid === true && result.error === undefined;
        } else {
          return result.isValid === false && result.error !== undefined;
        }
      })
    );
  });

  test('Property 2: File size validation', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: MAX_FILE_SIZE_BYTES * 2 }), size => {
        const result = validateFileSize(size);
        if (size <= MAX_FILE_SIZE_BYTES) {
          return result.isValid === true && result.error === undefined;
        } else {
          return result.isValid === false && result.error !== undefined;
        }
      })
    );
  });
});
