/**
 * Custom error class for Git operation failures
 */
export class GitError extends Error {
  details: string;
  metadata: Record<string, any>;

  constructor(message: string, details: string, metadata: Record<string, any> = {}) {
    super(message);
    this.name = 'GitError';
    this.details = details;
    this.metadata = metadata;

    // Captures the stack trace (required for extending Error in TypeScript)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GitError);
    }
  }
}

/**
 * Custom error class for user input validation
 */
export class ValidationError extends Error {
  field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * Custom error class for configuration issues
 */
export class ConfigError extends Error {
  configPath: string;

  constructor(message: string, configPath: string) {
    super(message);
    this.name = 'ConfigError';
    this.configPath = configPath;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConfigError);
    }
  }
}

/**
 * Error result interface for processed errors
 */
export interface ErrorResult {
  type: 'git' | 'validation' | 'config' | 'unknown';
  message: string;
  details: string;
  recoverable: boolean;
  suggestions: string[];
  error: Error; // Original error
}

/**
 * Interface for error handler
 */
export interface ErrorHandler {
  handleError(error: Error): ErrorResult;
  isGitError(error: Error): error is GitError;
  isValidationError(error: Error): error is ValidationError;
  isConfigError(error: Error): error is ConfigError;
  isNativeGitError(error: Error): boolean;
}

/**
 * Helper function to determine if an error is possibly recoverable
 */
const isRecoverableGitError = (error: GitError): boolean => {
  // Check common recoverable Git errors
  const recoverableErrors = [
    'failed to push',
    'could not lock ref',
    'could not resolve reference',
    'cannot merge',
    'needs merge',
    'not a git repository',
    'no changes added to commit',
  ];

  return recoverableErrors.some(
    (msg) =>
      error.message.toLowerCase().includes(msg) ||
      (error.details && error.details.toLowerCase().includes(msg)),
  );
};

/**
 * Generate recovery suggestions based on error type and details
 */
const generateSuggestions = (error: Error): string[] => {
  if (error instanceof GitError) {
    const msg = error.message.toLowerCase();
    const details = error.details.toLowerCase();

    if (msg.includes('not a git repository') || details.includes('not a git repository')) {
      return [
        'Make sure you are in a Git repository',
        'Run "git init" to initialize a new repository',
      ];
    }

    if (
      msg.includes('no changes added to commit') ||
      details.includes('no changes added to commit')
    ) {
      return [
        'Stage changes with "git add <file>" before committing',
        'Check git status to see which files need to be staged',
      ];
    }

    if (msg.includes('failed to push') || details.includes('failed to push')) {
      return [
        'Pull latest changes with "git pull" and resolve conflicts',
        'Force push with "git push -f" (use with caution)',
      ];
    }

    // Default Git suggestions
    return [
      'Check git status for more information',
      'Make sure you have the correct permissions',
      'Try running the git command manually',
    ];
  }

  if (error instanceof ValidationError) {
    return ['Check your input and try again', `Validation failed for field: ${error.field}`];
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
 * Factory function to create an error handler
 */
export const createErrorHandler = (): ErrorHandler => {
  return {
    /**
     * Handle an error and return a structured error result
     */
    handleError(error: Error): ErrorResult {
      // Handle native GitError from git module
      if (this.isNativeGitError(error)) {
        // Use the native GitError's adapter method if available
        // @ts-ignore - Property access is safe because we already checked with isNativeGitError
        if (typeof error.toErrorResult === 'function') {
          // @ts-ignore - Property access is safe because we already checked with isNativeGitError
          const baseResult = error.toErrorResult();
          return {
            ...baseResult,
            suggestions: generateSuggestions(error),
            error,
          } as ErrorResult;
        }
      }

      if (this.isGitError(error)) {
        return {
          type: 'git',
          message: error.message,
          details: error.details,
          recoverable: isRecoverableGitError(error),
          suggestions: generateSuggestions(error),
          error,
        };
      }

      if (this.isValidationError(error)) {
        return {
          type: 'validation',
          message: error.message,
          details: `Validation failed for field: ${error.field}`,
          recoverable: true,
          suggestions: generateSuggestions(error),
          error,
        };
      }

      if (this.isConfigError(error)) {
        return {
          type: 'config',
          message: error.message,
          details: `Configuration error in: ${error.configPath}`,
          recoverable: true,
          suggestions: generateSuggestions(error),
          error,
        };
      }

      // Handle unknown errors
      return {
        type: 'unknown',
        message: error.message || 'An unknown error occurred',
        details: error.stack || '',
        recoverable: false,
        suggestions: generateSuggestions(error),
        error,
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
        // @ts-ignore - We're checking if these properties exist
        typeof error.type === 'string' &&
        // @ts-ignore - We're checking if these properties exist
        typeof error.toUserMessage === 'function'
      );
    },
  };
};
