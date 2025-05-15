/**
 * Git change status types
 */
export enum GitChangeType {
  ADDED = 'added',
  MODIFIED = 'modified',
  DELETED = 'deleted',
  RENAMED = 'renamed',
  COPIED = 'copied',
  UNMODIFIED = 'unmodified',
  UNTRACKED = 'untracked',
  IGNORED = 'ignored',
  TYPE_CHANGED = 'type_changed',
}

/**
 * Git error types
 */
export enum GitErrorType {
  COMMAND_ERROR = 'command_error',
  VALIDATION_ERROR = 'validation_error',
  REPOSITORY_ERROR = 'repository_error',
  NETWORK_ERROR = 'network_error',
  PERMISSION_ERROR = 'permission_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * Git file status
 */
export interface GitFileStatus {
  path: string;
  type: GitChangeType;
  staged: boolean;
  originalPath?: string; // For renamed files
}

/**
 * Git repository status
 */
export interface GitStatus {
  isClean: boolean;
  current: string; // Current branch
  tracking?: string; // Upstream branch
  files: GitFileStatus[];
  staged: string[]; // Staged files
  modified: string[]; // Modified files
  deleted: string[]; // Deleted files
  untracked: string[]; // Untracked files
  ahead: number; // Commits ahead of upstream
  behind: number; // Commits behind upstream
}

/**
 * Result of a commit operation
 */
export interface CommitResult {
  commitHash: string;
  branch: string;
  filesChanged: number;
}

/**
 * Options for commit operation
 */
export interface CommitOptions {
  noVerify?: boolean;
  signOff?: boolean;
  allowEmpty?: boolean;
}

/**
 * Options for staging files
 */
export interface StageOptions {
  force?: boolean;
}
