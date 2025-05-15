export {
  isGitRepository,
  getRepositoryRoot,
  getRepositoryStatus,
  isSubmodule,
  findTopLevelRepository,
  validateRepository,
} from './repository';

export { createGitOperations, GitError, GitErrorType } from './operations';

export type { GitOperations } from './operations';

export type {
  GitStatus,
  GitFileStatus,
  GitChangeType,
  CommitResult,
  CommitOptions,
  StageOptions,
} from './types';
