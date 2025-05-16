import { GitError } from '@git/errors';
import { GitErrorType } from '@git/types';
import { createErrorHandler } from '@utils/errors';

describe('Git Error Handling', () => {
  describe('GitError', () => {
    it('should create a Git error with the correct properties', () => {
      const error = new GitError('Test error', GitErrorType.COMMAND_ERROR);

      expect(error.name).toBe('GitError');
      expect(error.message).toBe('Test error');
      expect(error.type).toBe(GitErrorType.COMMAND_ERROR);
    });

    it('should create a Git error with a cause', () => {
      const cause = new Error('Original error');
      const error = new GitError('Test error', GitErrorType.COMMAND_ERROR, cause);

      expect(error.cause).toBe(cause);
    });

    it('should determine if an error should be retried', () => {
      const indexLockError = new GitError(
        'Fatal: Unable to create index.lock',
        GitErrorType.COMMAND_ERROR,
      );
      expect(indexLockError.shouldRetry()).toBe(true);

      const networkError = new GitError('Network error', GitErrorType.NETWORK_ERROR);
      expect(networkError.shouldRetry()).toBe(true);

      const validationError = new GitError('Invalid input', GitErrorType.VALIDATION_ERROR);
      expect(validationError.shouldRetry()).toBe(false);
    });

    it('should generate user-friendly error messages', () => {
      const commandError = new GitError('Failed to execute command', GitErrorType.COMMAND_ERROR);
      expect(commandError.toUserMessage()).toContain('Git operation failed');

      const repoError = new GitError('Not a git repository', GitErrorType.REPOSITORY_ERROR);
      expect(repoError.toUserMessage()).toContain('Repository error');
    });
  });

  describe('Error handling integration', () => {
    it('should convert Git errors to error results', () => {
      const errorHandler = createErrorHandler();

      const gitError = new GitError('Failed to commit changes', GitErrorType.COMMAND_ERROR);

      const errorResult = errorHandler.handleError(gitError);

      expect(errorResult.type).toBe('git');
      expect(errorResult.message).toBe('Failed to commit changes');
      expect(errorResult.suggestions.length).toBeGreaterThan(0);
    });

    it('should extract helpful information from error details', () => {
      const errorHandler = createErrorHandler();

      const gitError = new GitError('Failed to commit', GitErrorType.COMMAND_ERROR);

      const errorResult = errorHandler.handleError(gitError);

      expect(errorResult.type).toBe('git');
      expect(errorResult.suggestions).toEqual(expect.arrayContaining(['Try the operation again']));
    });
  });

  describe('fromError static method', () => {
    it('should identify permission errors', () => {
      const permissionError = new Error('Permission denied to .git/config');
      const gitError = GitError.fromError(permissionError, 'config');

      expect(gitError.type).toBe(GitErrorType.PERMISSION_ERROR);
      expect(gitError.message).toContain('Error during config');
    });

    it('should identify repository errors', () => {
      const repoError = new Error('fatal: not a git repository');
      const gitError = GitError.fromError(repoError, 'status');

      expect(gitError.type).toBe(GitErrorType.REPOSITORY_ERROR);
      expect(gitError.message).toContain('Error during status');
    });

    it('should pass through GitError instances', () => {
      const originalError = new GitError('Original error', GitErrorType.VALIDATION_ERROR);
      const resultError = GitError.fromError(originalError, 'commit');

      expect(resultError).toBe(originalError);
      expect(resultError.type).toBe(GitErrorType.VALIDATION_ERROR);
    });

    it('should handle non-Error objects', () => {
      const nonError = 'This is just a string';
      const gitError = GitError.fromError(nonError, 'pull');

      expect(gitError instanceof GitError).toBe(true);
      expect(gitError.message).toContain('Error during pull');
      expect(gitError.message).toContain('This is just a string');
    });
  });
});
