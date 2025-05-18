import { OverrideStorage, createFileOverrideStorage } from '../../../src/core/override-storage';
import { OverrideRecord } from '../../../src/core/override-manager';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    access: jest.fn(),
  },
}));

describe('Override Storage', () => {
  let overrideStorage: OverrideStorage;
  const testStoragePath = '/test/overrides.json';

  beforeEach(() => {
    // Reset mocks
    jest.resetAllMocks();

    // Create storage instance
    overrideStorage = createFileOverrideStorage(testStoragePath);
  });

  describe('saveOverrides', () => {
    it('should save overrides to file', async () => {
      const overrides: OverrideRecord[] = [
        {
          patternId: 'test-pattern',
          reason: 'Test reason',
          createdAt: new Date().toISOString(),
        },
      ];

      await overrideStorage.saveOverrides(overrides);

      // Check that directory was created
      expect(fs.promises.mkdir).toHaveBeenCalledWith(path.dirname(testStoragePath), {
        recursive: true,
      });

      // Check that file was written
      expect(fs.promises.writeFile).toHaveBeenCalledWith(
        testStoragePath,
        expect.any(String),
        'utf8',
      );

      // Check that content is correct JSON
      const content = (fs.promises.writeFile as jest.Mock).mock.calls[0][1];
      const parsed = JSON.parse(content);
      expect(parsed).toEqual(overrides);
    });
  });

  describe('loadOverrides', () => {
    it('should load overrides from file', async () => {
      const overrides: OverrideRecord[] = [
        {
          patternId: 'test-pattern',
          reason: 'Test reason',
          createdAt: new Date().toISOString(),
        },
      ];

      // Mock file exists
      (fs.promises.access as jest.Mock).mockResolvedValue(undefined);

      // Mock file content
      (fs.promises.readFile as jest.Mock).mockResolvedValue(JSON.stringify(overrides));

      const result = await overrideStorage.loadOverrides();

      expect(result).toEqual(overrides);
      expect(fs.promises.readFile).toHaveBeenCalledWith(testStoragePath, 'utf8');
    });

    it('should return empty array if file does not exist', async () => {
      // Mock file does not exist
      (fs.promises.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));

      const result = await overrideStorage.loadOverrides();

      expect(result).toEqual([]);
      expect(fs.promises.readFile).not.toHaveBeenCalled();
    });
  });
});
