import path from 'path';
import { FileType, FileChange, ChangeCategories, ChangeStats } from './types';

/**
 * Map file extension to file type
 * @param filePath File path
 * @returns Type of file
 */
export function getFileType(filePath: string): FileType {
  if (!filePath) {
    return 'other';
  }
  const ext = path.extname(filePath).toLowerCase();
  const basename = path.basename(filePath).toLowerCase();

  // Check for test files
  if (
    basename.includes('.test.') ||
    basename.includes('.spec.') ||
    filePath.includes('/__tests__/') ||
    filePath.includes('/test/') ||
    filePath.includes('/tests/')
  ) {
    return 'test';
  }

  // Check for documentation
  if (
    ext === '.md' ||
    ext === '.txt' ||
    ext === '.rst' ||
    basename === 'license' ||
    basename === 'readme' ||
    filePath.includes('/docs/') ||
    filePath.includes('/documentation/')
  ) {
    return 'docs';
  }

  // Check for source code
  if (
    [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.py',
      '.rb',
      '.java',
      '.c',
      '.cpp',
      '.cs',
      '.go',
      '.rs',
      '.php',
      '.swift',
    ].includes(ext)
  ) {
    return 'source';
  }

  // Check for configuration files
  if (
    ['.json', '.yml', '.yaml', '.toml', '.ini', '.conf', '.config', '.env'].includes(ext) ||
    basename.includes('rc') ||
    basename === 'package.json' ||
    basename === 'tsconfig.json' ||
    basename.includes('webpack') ||
    basename.includes('eslint') ||
    basename.includes('prettier')
  ) {
    return 'config';
  }

  // Check for assets
  if (
    [
      '.png',
      '.jpg',
      '.jpeg',
      '.gif',
      '.svg',
      '.ico',
      '.ttf',
      '.woff',
      '.woff2',
      '.eot',
      '.otf',
      '.mp3',
      '.mp4',
      '.wav',
      '.avi',
      '.pdf',
    ].includes(ext)
  ) {
    return 'assets';
  }

  // Default to other
  return 'other';
}

/**
 * Categorize changes by type, change type, and staging status
 * @param changes List of file changes
 * @returns Categorized changes
 */
export function categorizeChanges(changes: FileChange[]): ChangeCategories {
  const categories: ChangeCategories = {
    byType: {
      source: [],
      test: [],
      docs: [],
      config: [],
      assets: [],
      other: [],
    },
    byChangeType: {
      added: [],
      modified: [],
      deleted: [],
      renamed: [],
      copied: [],
      untracked: [],
      unknown: [],
    },
    staged: [],
    unstaged: [],
  };

  for (const change of changes) {
    // Get file path (or destination path for renames)
    const filePath = change.path;

    // Categorize by file type
    const fileType = change.fileType || getFileType(filePath);
    categories.byType[fileType].push(filePath);

    // Categorize by change type
    categories.byChangeType[change.type].push(filePath);

    // Categorize by staging status
    if (change.staged) {
      categories.staged.push(filePath);
    } else {
      categories.unstaged.push(filePath);
    }
  }

  return categories;
}

/**
 * Get statistics about changes
 * @param changes List of file changes
 * @returns Change statistics
 */
export function getChangeStats(changes: FileChange[]): ChangeStats {
  // Initialize stats object
  const stats: ChangeStats = {
    totalFiles: 0,
    stagedFiles: 0,
    unstagedFiles: 0,
    insertions: 0,
    deletions: 0,
    byType: {
      source: { files: 0, insertions: 0, deletions: 0 },
      test: { files: 0, insertions: 0, deletions: 0 },
      docs: { files: 0, insertions: 0, deletions: 0 },
      config: { files: 0, insertions: 0, deletions: 0 },
      assets: { files: 0, insertions: 0, deletions: 0 },
      other: { files: 0, insertions: 0, deletions: 0 },
    },
  };

  // Count files and changes
  for (const change of changes) {
    stats.totalFiles++;

    if (change.staged) {
      stats.stagedFiles++;
    } else {
      stats.unstagedFiles++;
    }

    // Add insertions and deletions
    stats.insertions += change.insertions || 0;
    stats.deletions += change.deletions || 0;

    // Update file type stats
    const fileType = change.fileType || getFileType(change.path);
    const typeStats = stats.byType[fileType];

    typeStats.files++;
    typeStats.insertions += change.insertions || 0;
    typeStats.deletions += change.deletions || 0;
  }

  return stats;
}

/**
 * Format a number with a leading sign (+ or -)
 * @param num Number to format
 * @returns Formatted number string
 */
export function formatWithSign(num: number): string {
  if (num === 0) return '0';
  return num > 0 ? `+${num}` : `${num}`;
}

/**
 * Format insertions and deletions for display
 * @param insertions Number of insertions
 * @param deletions Number of deletions
 * @returns Formatted string
 */
export function formatChanges(insertions: number, deletions: number): string {
  const parts = [];

  if (insertions > 0) {
    parts.push(`+${insertions}`);
  }

  if (deletions > 0) {
    parts.push(`-${deletions}`);
  }

  return parts.join(', ');
}
