import path from 'path';
import fs from 'fs';

/**
 * Get the path to a test fixture file
 * @param relativePath Path to the fixture file, relative to the fixtures directory
 * @returns Absolute path to the fixture file
 */
export const getFixturePath = (relativePath: string): string => {
  return path.join(__dirname, '../fixtures', relativePath);
};

/**
 * Read a test fixture file
 * @param relativePath Path to the fixture file, relative to the fixtures directory
 * @returns Contents of the fixture file
 */
export const readFixture = (relativePath: string): string => {
  return fs.readFileSync(getFixturePath(relativePath), 'utf-8');
};

/**
 * Create a temporary test file
 * @param content Content to write to the file
 * @param extension File extension (default: '.txt')
 * @returns Path to the created file
 */
export const createTempFile = (content: string, extension = '.txt'): string => {
  const tempDir = path.join(__dirname, '../fixtures/temp');

  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const tempFile = path.join(tempDir, `test-${Date.now()}${extension}`);
  fs.writeFileSync(tempFile, content, 'utf-8');

  return tempFile;
};

/**
 * Clean up temporary test files
 */
export const cleanupTempFiles = (): void => {
  const tempDir = path.join(__dirname, '../fixtures/temp');

  if (fs.existsSync(tempDir)) {
    const files = fs.readdirSync(tempDir);

    for (const file of files) {
      fs.unlinkSync(path.join(tempDir, file));
    }
  }
};
