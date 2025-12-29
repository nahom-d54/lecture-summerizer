import * as fc from 'fast-check';
import { StorageService } from './storage.service';

// Mock fs/promises
jest.mock('fs/promises', () => ({
  access: jest.fn().mockResolvedValue(true),
  mkdir: jest.fn().mockResolvedValue(true),
  writeFile: jest.fn().mockResolvedValue(true),
  unlink: jest.fn().mockResolvedValue(true),
}));

describe('StorageService Properties', () => {
  let storageService: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    storageService = new StorageService();
  });

  test('Property 3: File-user association', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.string(),
        fc.string(),
        async (userId, content, originalName) => {
          const buffer = Buffer.from(content);
          const safeOriginalName = originalName.length > 0 ? originalName : 'test.txt';

          const fileName = await storageService.saveFile(userId, buffer, safeOriginalName);

          return fileName.startsWith(`${userId}_`);
        }
      )
    );
  });
});
