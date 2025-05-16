import simpleGit, { SimpleGit } from 'simple-git';
import { GitStatus, CommitResult, CommitOptions, StageOptions, GitErrorType } from './types';
import { GitError } from './errors';

/**
 * Interface for Git operations
 */
export interface GitOperations {
  getStatus(): Promise<GitStatus>;
  stageFiles(files: string[], options?: StageOptions): Promise<void>;
  unstageFiles(files: string[]): Promise<void>;
  createCommit(message: string, options?: CommitOptions): Promise<CommitResult>;
  getCurrentBranch(): Promise<string>;
  getConfig(key: string): Promise<string>;
  getBranches(): Promise<string[]>;
  checkoutBranch(branch: string): Promise<void>;
  hasRemoteTracking(): Promise<boolean>;
}

/**
 * Retry configuration
 */
interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
}

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 100, // ms
  maxDelay: 1000, // ms
};

/**
 * Implementation of the Git operations interface
 */
class GitOperationsImpl implements GitOperations {
  private git: SimpleGit;
  private retryConfig: RetryConfig;

  constructor(repositoryPath: string, retryConfig?: Partial<RetryConfig>) {
    this.git = simpleGit(repositoryPath);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Execute a Git operation with retry logic
   * @param operation Function that performs the Git operation
   * @param operationName Name of the operation (for error messages)
   * @returns Result of the operation
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    let lastError: GitError | null = null;
    let delay = this.retryConfig.initialDelay;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        const gitError = GitError.fromError(error, operationName);
        lastError = gitError;

        // If we've reached max retries or shouldn't retry this error, throw
        if (attempt >= this.retryConfig.maxRetries || !gitError.shouldRetry()) {
          throw gitError;
        }

        // Exponential backoff with jitter
        const jitter = Math.random() * 0.1 * delay;
        await new Promise((resolve) => setTimeout(resolve, delay + jitter));
        delay = Math.min(delay * 2, this.retryConfig.maxDelay);
      }
    }

    // This should never happen, but TypeScript requires a return
    throw lastError || new GitError(`Failed to execute ${operationName}`);
  }

  /**
   * Get the current status of the repository
   * @returns Git status
   */
  async getStatus(): Promise<GitStatus> {
    return this.executeWithRetry(async () => {
      const status = await this.git.status();

      // Transform to our interface
      return {
        isClean: status.isClean(),
        current: status.current || '',
        tracking: status.tracking || undefined,
        files: [], // Would be mapped from status in a full implementation
        staged: status.staged,
        modified: status.modified,
        deleted: status.deleted,
        untracked: status.not_added,
        ahead: status.ahead,
        behind: status.behind,
      };
    }, 'getStatus');
  }

  /**
   * Stage files for commit
   * @param files Files to stage
   * @param options Staging options (not implemented yet)
   */
  async stageFiles(files: string[], _options?: StageOptions): Promise<void> {
    if (files.length === 0) {
      return;
    }

    return this.executeWithRetry(async () => {
      await this.git.add(files);
    }, 'stageFiles');
  }

  /**
   * Unstage files
   * @param files Files to unstage
   */
  async unstageFiles(files: string[]): Promise<void> {
    if (files.length === 0) {
      return;
    }

    return this.executeWithRetry(async () => {
      await this.git.reset(['HEAD', '--', ...files]);
    }, 'unstageFiles');
  }

  /**
   * Create a commit
   * @param message Commit message
   * @param options Commit options
   * @returns Commit result
   */
  async createCommit(message: string, options?: CommitOptions): Promise<CommitResult> {
    if (!message.trim()) {
      throw new GitError('Commit message cannot be empty', GitErrorType.VALIDATION_ERROR);
    }

    return this.executeWithRetry(async () => {
      const commitOptions: string[] = [];

      if (options?.noVerify) {
        commitOptions.push('--no-verify');
      }

      if (options?.signOff) {
        commitOptions.push('--signoff');
      }

      if (options?.allowEmpty) {
        commitOptions.push('--allow-empty');
      }

      const result = await this.git.commit(message, commitOptions);

      return {
        commitHash: result.commit,
        branch: result.branch,
        filesChanged: result.summary.changes,
      };
    }, 'createCommit');
  }

  /**
   * Get the current branch name
   * @returns Branch name
   */
  async getCurrentBranch(): Promise<string> {
    return this.executeWithRetry(async () => {
      return this.git.revparse(['--abbrev-ref', 'HEAD']);
    }, 'getCurrentBranch');
  }

  /**
   * Get a Git configuration value
   * @param key Configuration key
   * @returns Configuration value
   */
  async getConfig(key: string): Promise<string> {
    return this.executeWithRetry(async () => {
      const result = await this.git.raw(['config', '--get', key]);
      return result.trim();
    }, 'getConfig');
  }

  /**
   * Get all available branches
   * @returns List of branch names
   */
  async getBranches(): Promise<string[]> {
    return this.executeWithRetry(async () => {
      const result = await this.git.branch();
      return result.all;
    }, 'getBranches');
  }

  /**
   * Checkout a branch
   * @param branch Branch name
   */
  async checkoutBranch(branch: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.git.checkout(branch);
    }, 'checkoutBranch');
  }

  /**
   * Check if the current branch has a remote tracking branch
   * @returns True if the current branch has a remote tracking branch
   */
  async hasRemoteTracking(): Promise<boolean> {
    try {
      const branch = await this.getCurrentBranch();
      return this.executeWithRetry(async () => {
        try {
          const result = await this.git.raw(['rev-parse', '--abbrev-ref', `${branch}@{upstream}`]);
          return !!result.trim();
        } catch (error) {
          // This is not really an error, it just means there's no upstream
          return false;
        }
      }, 'hasRemoteTracking');
    } catch (error) {
      // If we can't get the current branch, assume no tracking
      return false;
    }
  }
}

/**
 * Create a Git operations interface for a repository
 * @param repositoryPath Path to the Git repository
 * @param retryConfig Retry configuration
 * @returns Git operations interface
 */
export function createGitOperations(
  repositoryPath: string,
  retryConfig?: Partial<RetryConfig>,
): GitOperations {
  return new GitOperationsImpl(repositoryPath, retryConfig);
}

// Export types
export { GitError, GitErrorType };
