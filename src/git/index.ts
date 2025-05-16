export {
  isGitRepository,
  getRepositoryRoot,
  getRepositoryStatus,
  isSubmodule,
  findTopLevelRepository,
  validateRepository,
} from './repository';

export { createGitOperations, GitError, GitErrorType } from './operations';

export {
  getFileChanges,
  categorizeChanges,
  getChangeStats,
  getFileType,
  parseGitDiff,
} from './change-detection';

export { mapGitStatusToStagedFiles } from './utils';

export type { GitOperations } from './operations';

export type {
  GitStatus,
  GitFileStatus,
  GitChangeType,
  CommitResult,
  CommitOptions,
  StageOptions,
} from './types';

export type {
  FileChange,
  ChangeType,
  ChangeCategories,
  ChangeStats,
  FileDiff,
} from './change-detection/types';
