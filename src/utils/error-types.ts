/**
 * Base interface for all error types in the application
 */
export interface ErrorBase {
  /** Error message */
  message: string;

  /** Error name */
  name: string;

  /** Detailed error information */
  details: string;

  /** Additional metadata about the error */
  metadata: Record<string, any>;

  /** Original cause of the error if applicable */
  cause?: Error;

  /** Convert to user-friendly message */
  toUserMessage(): string;

  /** Determine if error should be retried */
  shouldRetry(): boolean;

  /** Convert to error result for display */
  toErrorResult(): Partial<ErrorResult>;
}

/**
 * Error result interface for processed errors
 */
export interface ErrorResult {
  /** Type of error for categorization */
  type: 'git' | 'validation' | 'config' | 'unknown';

  /** Error message */
  message: string;

  /** Detailed error information */
  details: string;

  /** Whether the operation can be retried */
  recoverable: boolean;

  /** Suggestions for resolving the error */
  suggestions: string[];

  /** Original error object */
  error: Error;
}

/**
 * Interface for common error handling capabilities
 */
export interface ErrorHandler {
  /** Process an error into a standardized format */
  handleError(error: Error): ErrorResult;

  /** Check if error is a GitError from utils */
  isGitError(error: Error): boolean;

  /** Check if error is a ValidationError */
  isValidationError(error: Error): boolean;

  /** Check if error is a ConfigError */
  isConfigError(error: Error): boolean;

  /** Check if error is a GitError from git module */
  isNativeGitError(error: Error): boolean;
}
