/**
 * Types of file changes
 */
export type ChangeType =
  | 'added'
  | 'modified'
  | 'deleted'
  | 'renamed'
  | 'copied'
  | 'untracked'
  | 'unknown';

/**
 * Categories for file types
 */
export type FileType =
  | 'source' // .ts, .js, .jsx, .tsx, etc.
  | 'test' // test files
  | 'docs' // documentation
  | 'config' // configuration files
  | 'assets' // images, fonts, etc.
  | 'other'; // anything else

/**
 * Represents a changed file
 */
export interface FileChange {
  path: string; // File path relative to repo root
  type: ChangeType; // Type of change
  staged: boolean; // Whether change is staged
  from?: string; // Original path (for renamed files)
  insertions?: number; // Lines added
  deletions?: number; // Lines removed
  binary?: boolean; // Whether file is binary
  fileType?: FileType; // Type of file
}

/**
 * Categorized changes
 */
export interface ChangeCategories {
  // By file type
  byType: Record<FileType, string[]>;

  // By change type
  byChangeType: Record<ChangeType, string[]>;

  // By staging status
  staged: string[];
  unstaged: string[];
}

/**
 * Statistics for file types
 */
export interface FileTypeStats {
  files: number;
  insertions: number;
  deletions: number;
}

/**
 * Statistics about changes
 */
export interface ChangeStats {
  totalFiles: number;
  stagedFiles: number;
  unstagedFiles: number;
  insertions: number;
  deletions: number;
  byType: Record<FileType, FileTypeStats>;
}

/**
 * A hunk from a diff
 */
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

/**
 * Parsed file diff
 */
export interface FileDiff {
  filePath: string;
  oldPath?: string;
  insertions: number;
  deletions: number;
  binary: boolean;
  hunks: DiffHunk[];
}
