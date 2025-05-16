import { ErrorBase, ErrorResult, ErrorHandler } from './error-types';

/**
 * Custom error class for Git operation failures
 */
export class GitError extends Error implements ErrorBase {
  details: string;
  metadata: Record<string, any>;
  cause?: Error;

  constructor(message: string, details: string, metadata: Record<string, any> = {}, cause?: Error) {
    super(message);
    this.name = 'GitError';
    this.details = details;
    this.metadata = metadata;
    this.cause = cause;

    // Captures the stack trace (required for extending Error in TypeScript)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GitError);
    }
  }

  /**
   * Determine if this error should be retried
   */
  shouldRetry(): boolean {
    const recoverablePatterns = [
      'index.lock',
      'failed to push',
      'could not lock ref',
      'could not resolve reference',
      'cannot merge',
      'needs merge',
      'not a git repository',
      'no changes added to commit',
    ];

    return recoverablePatterns.some(
      (pattern) =>
        this.message.toLowerCase().includes(pattern) ||
        this.details.toLowerCase().includes(pattern),
    );
  }

  /**
   * Get a user-friendly message
   */
  toUserMessage(): string {
    return `Git error: ${this.message}`;
  }

  /**
   * Convert to error result format
   */
  toErrorResult(): Partial<ErrorResult> {
    return {
      type: 'git',
      message: this.message,
      details: this.details,
      recoverable: this.shouldRetry(),
      error: this,
    };
  }
}

/**
 * Custom error class for user input validation
 */
export class ValidationError extends Error implements ErrorBase {
  field: string;
  details: string;
  metadata: Record<string, any>;
  cause?: Error;

  constructor(message: string, field: string, cause?: Error) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.details = `Validation failed for field: ${field}`;
    this.metadata = { field };
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }

  /**
   * Validation errors are always recoverable
   */
  shouldRetry(): boolean {
    return true;
  }

  /**
   * Get a user-friendly message
   */
  toUserMessage(): string {
    return `Invalid input: ${this.message} (${this.field})`;
  }

  /**
   * Convert to error result format
   */
  toErrorResult(): Partial<ErrorResult> {
    return {
      type: 'validation',
      message: this.message,
      details: this.details,
      recoverable: true,
      error: this,
    };
  }
}

/**
 * Custom error class for configuration issues
 */
export class ConfigError extends Error implements ErrorBase {
  configPath: string;
  details: string;
  metadata: Record<string, any>;
  cause?: Error;

  constructor(message: string, configPath: string, cause?: Error) {
    super(message);
    this.name = 'ConfigError';
    this.configPath = configPath;
    this.details = `Configuration error in: ${configPath}`;
    this.metadata = { configPath };
    this.cause = cause;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigError);
    }
  }

  /**
   * Config errors are generally recoverable
   */
  shouldRetry(): boolean {
    return true;
  }

  /**
   * Get a user-friendly message
   */
  toUserMessage(): string {
    return `Configuration error: ${this.message} (${this.configPath})`;
  }

  /**
   * Convert to error result format
   */
  toErrorResult(): Partial<ErrorResult> {
    return {
      type: 'config',
      message: this.message,
      details: this.details,
      recoverable: true,
      error: this,
    };
  }
}

/**
 * Create an unknown error wrapper that conforms to our error interface
 * @param error Original error
 * @returns Enhanced error with added properties
 */
export class UnknownError extends Error implements ErrorBase {
  details: string;
  metadata: Record<string, any>;
  cause?: Error;

  constructor(error: Error | string) {
    const message = error instanceof Error ? error.message : error;
    super(message);
    this.name = 'UnknownError';
    this.details = error instanceof Error ? error.stack || '' : '';
    this.metadata = {};
    this.cause = error instanceof Error ? error : undefined;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownError);
    }
  }

  /**
   * Unknown errors are not recoverable by default
   */
  shouldRetry(): boolean {
    return false;
  }

  /**
   * Get a user-friendly message
   */
  toUserMessage(): string {
    return `Error: ${this.message}`;
  }

  /**
   * Convert to error result format
   */
  toErrorResult(): Partial<ErrorResult> {
    return {
      type: 'unknown',
      message: this.message,
      details: this.details,
      recoverable: false,
      error: this,
    };
  }
}

/**
 * Generate recovery suggestions based on error type and details
 */
const generateSuggestions = (error: Error): string[] => {
  // Generic helper to search for patterns in error text
  const includesPattern = (patterns: string[], text: string): boolean => {
    return patterns.some((pattern) => text.toLowerCase().includes(pattern.toLowerCase()));
  };

  // Enhanced suggestion generation using ErrorBase interface when available
  if ((error as ErrorBase).toUserMessage && (error as ErrorBase).details) {
    const errorBase = error as ErrorBase;
    const text = `${errorBase.message} ${errorBase.details}`.toLowerCase();

    // Repository errors
    if (includesPattern(['not a git repository', 'not a git repo', 'outside repository'], text)) {
      return [
        'Make sure you are in a Git repository',
        'Run "git init" to initialize a new repository',
        'Check that your working directory is correct',
      ];
    }

    // Staging errors
    if (includesPattern(['no changes added', 'no changes staged', 'nothing to commit'], text)) {
      return [
        'Stage changes with "git add <file>" before committing',
        'Check git status to see which files need to be staged',
        'Use "git add ." to stage all changes',
      ];
    }

    // Push/pull errors
    if (includesPattern(['failed to push', 'rejected', 'non-fast-forward'], text)) {
      return [
        'Pull latest changes with "git pull" and resolve conflicts',
        'Use "git pull --rebase" to rebase your changes on top of the remote',
        'Force push with "git push -f" only if you are sure (use with caution)',
      ];
    }

    // Merge conflicts
    if (includesPattern(['merge conflict', 'needs merge', 'cannot merge'], text)) {
      return [
        'Resolve merge conflicts in the affected files',
        'Use "git status" to see which files have conflicts',
        'After resolving conflicts, use "git add" on the fixed files',
      ];
    }

    // Lock file errors
    if (includesPattern(['index.lock', 'could not lock', 'unable to create lock'], text)) {
      return [
        'Another Git process may be running',
        'If no other process is using Git, remove the lock file with "rm -f .git/index.lock"',
        'Wait a moment and try again',
      ];
    }

    // Auth errors
    if (
      includesPattern(['permission denied', 'authentication', 'could not read from remote'], text)
    ) {
      return [
        'Check your Git credentials and permissions',
        'Ensure your SSH key or access token is valid',
        'Verify that you have access rights to the repository',
      ];
    }
  }

  // Type-specific fallbacks
  if (error instanceof GitError) {
    return [
      'Check git status for more information',
      'Make sure you have the correct permissions',
      'Try running the git command manually',
    ];
  }

  if (error instanceof ValidationError) {
    return [
      'Check your input and try again',
      `Validation failed for field: ${error.field}`,
      'Ensure your input meets the requirements',
    ];
  }

  if (error instanceof ConfigError) {
    return [
      'Check your configuration file for errors',
      `Configuration file: ${error.configPath}`,
      'Make sure the format is correct',
    ];
  }

  // Default suggestions for unknown errors
  return [
    'Try the operation again',
    'Check the application logs for more details',
    'Report this issue if it persists',
  ];
};

/**
 * Error logging function that can be customized by the application
 */
let errorLogger: (error: Error, context?: Record<string, any>) => void =
  // Default minimal implementation
  (error: Error, context = {}) => {
    console.error(
      `[ERROR] ${error.name}: ${error.message}`,
      context,
      error.stack ? `\n${error.stack}` : '',
    );
  };

/**
 * Set a custom error logger
 */
export function setErrorLogger(
  logger: (error: Error, context?: Record<string, any>) => void,
): void {
  errorLogger = logger;
}

/**
 * Get the current error logger
 */
export function getErrorLogger(): (error: Error, context?: Record<string, any>) => void {
  return errorLogger;
}

/**
 * Factory function to create an error handler
 */
export const createErrorHandler = (): ErrorHandler => {
  return {
    /**
     * Handle an error and return a structured error result
     */
    handleError(error: Error, context?: Record<string, any>): ErrorResult {
      // Log the error
      errorLogger(error, context);

      // Try to get error result from ErrorBase interface if available
      const errorWithBase = error as unknown as ErrorBase;
      if (typeof errorWithBase.toErrorResult === 'function') {
        const baseResult = errorWithBase.toErrorResult();

        // Fill in any missing fields and ensure suggestions
        return {
          type: baseResult.type || 'unknown',
          message: baseResult.message || error.message || 'Unknown error',
          details: baseResult.details || error.stack || '',
          recoverable: baseResult.recoverable ?? false,
          suggestions: generateSuggestions(error),
          error: baseResult.error || error,
        };
      }

      // Fallback handling for non-conforming errors
      if (this.isGitError(error)) {
        return {
          type: 'git',
          message: error.message,
          details: (error as GitError).details,
          recoverable: (error as GitError).shouldRetry(),
          suggestions: generateSuggestions(error),
          error,
        };
      }

      if (this.isValidationError(error)) {
        return {
          type: 'validation',
          message: error.message,
          details: `Validation failed for field: ${(error as ValidationError).field}`,
          recoverable: true,
          suggestions: generateSuggestions(error),
          error,
        };
      }

      if (this.isConfigError(error)) {
        return {
          type: 'config',
          message: error.message,
          details: `Configuration error in: ${(error as ConfigError).configPath}`,
          recoverable: true,
          suggestions: generateSuggestions(error),
          error,
        };
      }

      // Handle unknown errors by wrapping them
      const unknownError = new UnknownError(error);
      return {
        type: 'unknown',
        message: unknownError.message,
        details: unknownError.details,
        recoverable: false,
        suggestions: generateSuggestions(unknownError),
        error: unknownError,
      };
    },

    /**
     * Type guard for Git errors
     */
    isGitError(error: Error): error is GitError {
      return error instanceof GitError;
    },

    /**
     * Type guard for validation errors
     */
    isValidationError(error: Error): error is ValidationError {
      return error instanceof ValidationError;
    },

    /**
     * Type guard for configuration errors
     */
    isConfigError(error: Error): error is ConfigError {
      return error instanceof ConfigError;
    },

    /**
     * Check if error is a native GitError from the git module
     */
    isNativeGitError(error: Error): boolean {
      return (
        error.name === 'GitError' &&
        // These checks are approximate, but sufficient for our use case
        typeof (error as any).type === 'string' &&
        typeof (error as any).toUserMessage === 'function'
      );
    },
  };
};
