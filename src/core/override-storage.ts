import * as fs from 'fs';
import * as path from 'path';
import { OverrideRecord } from './override-manager';

/**
 * Interface for override storage
 */
export interface OverrideStorage {
  /**
   * Save overrides to persistent storage
   * @param overrides Array of override records to save
   */
  saveOverrides(overrides: OverrideRecord[]): Promise<void>;

  /**
   * Load overrides from persistent storage
   * @returns Array of override records
   */
  loadOverrides(): Promise<OverrideRecord[]>;
}

/**
 * Factory function to create file-based override storage
 *
 * @param filePath Path to the file for storing overrides
 * @returns A new override storage instance
 */
export const createFileOverrideStorage = (filePath: string): OverrideStorage => {
  return {
    /**
     * Save overrides to file
     */
    async saveOverrides(overrides: OverrideRecord[]): Promise<void> {
      try {
        // Create directory if it doesn't exist
        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

        // Write overrides to file
        await fs.promises.writeFile(filePath, JSON.stringify(overrides, null, 2), 'utf8');
      } catch (error: unknown) {
        console.error('Failed to save overrides:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to save overrides: ${errorMessage}`);
      }
    },

    /**
     * Load overrides from file
     */
    async loadOverrides(): Promise<OverrideRecord[]> {
      try {
        // Check if file exists
        await fs.promises.access(filePath);

        // Read file
        const content = await fs.promises.readFile(filePath, 'utf8');

        // Parse JSON
        return JSON.parse(content) as OverrideRecord[];
      } catch (error: unknown) {
        // If file doesn't exist, return empty array
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
          return [];
        }

        console.error('Failed to load overrides:', error);
        return [];
      }
    },
  };
};
