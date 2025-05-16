import { GitErrorType } from './types';
import type { ErrorResult } from '@utils/errors';

/**
 * Custom error class for Git operations
 */
export class GitError extends Error {
  type: GitErrorType;
  cause?: Error;
  details?: string;
  metadata?: Record<string, any>;

  constructor(message: string, type: GitErrorType = GitErrorType.UNKNOWN_ERROR, cause?: Error) {
    super(message);
    this.name = 'GitError';
    this.type = type;
    this.cause = cause;
    this.details = cause?.message || '';
    this.metadata = {};

    // Captures the stack trace (required for extending Error in TypeScript)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GitError);
    }
  }

  /**
   * Determine if an error should trigger a retry
   * @returns True if the operation should be retried
   */
  shouldRetry(): boolean {
    // Retry on index.lock errors, which are often transient
    if (this.message.includes('index.lock')) {
      return true;
    }

    // Retry on network errors
    if (this.type === GitErrorType.NETWORK_ERROR) {
      return true;
    }

    return false;
  }

  /**
   * Get a user-friendly error message
   * @returns A message suitable for displaying to users
   */
  toUserMessage(): string {
    switch (this.type) {
      case GitErrorType.COMMAND_ERROR:
        return `Git operation failed: ${this.message}`;
      case GitErrorType.VALIDATION_ERROR:
        return `Invalid input: ${this.message}`;
      case GitErrorType.REPOSITORY_ERROR:
        return `Repository error: ${this.message}`;
      case GitErrorType.NETWORK_ERROR:
        return `Network error: ${this.message}`;
      case GitErrorType.PERMISSION_ERROR:
        return `Permission denied: ${this.message}`;
      default:
        return `Git error: ${this.message}`;
    }
  }

  /**
   * Create an error from a caught exception
   * @param error The caught error
   * @param operation The operation that was being performed
   * @returns A GitError instance
   */
  static fromError(error: unknown, operation: string): GitError {
    if (error instanceof GitError) {
      return error;
    }

    const message = error instanceof Error ? error.message : String(error);

    // Determine error type
    let type = GitErrorType.UNKNOWN_ERROR;

    if (message.includes('Permission denied')) {
      type = GitErrorType.PERMISSION_ERROR;
    } else if (message.includes('remote') || message.includes('network')) {
      type = GitErrorType.NETWORK_ERROR;
    } else if (message.includes('not a git repository')) {
      type = GitErrorType.REPOSITORY_ERROR;
    } else {
      type = GitErrorType.COMMAND_ERROR;
    }

    return new GitError(
      `Error during ${operation}: ${message}`,
      type,
      error instanceof Error ? error : undefined,
    );
  }

  /**
   * Convert to a format compatible with the ErrorResult interface
   * This adapter method helps integrate with the utility error handler
   */
  toErrorResult(): Partial<ErrorResult> {
    return {
      type: 'git',
      message: this.message,
      details: this.details || this.toUserMessage(),
      recoverable: this.shouldRetry(),
      error: this,
    };
  }
}
