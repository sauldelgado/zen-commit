// Register module aliases for runtime resolution
import 'module-alias/register';
import * as path from 'path';

/**
 * Resolves a path using TypeScript path aliases
 * @param filePath - The path to resolve
 * @returns The resolved path
 */
export const resolvePath = (filePath: string): string => {
  // Handle TypeScript path alias resolution
  // In the future this could contain more complex path resolution logic
  return filePath;
};

/**
 * Resolves a path relative to the project root
 * @param relativePath - Path relative to project root
 * @returns Absolute path
 */
export const resolveProjectPath = (relativePath: string): string => {
  return path.resolve(process.cwd(), relativePath);
};
