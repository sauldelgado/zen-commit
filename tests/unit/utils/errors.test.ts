import { GitError, ValidationError, ConfigError, createErrorHandler } from '@utils/errors';

describe('Error Handling Utilities', () => {
  describe('GitError', () => {
    it('should create a properly formatted Git error', () => {
      const error = new GitError('Failed to commit changes', 'git commit failed', {
        code: 1,
        command: 'git commit -m "test"',
      });

      expect(error.name).toBe('GitError');
      expect(error.message).toBe('Failed to commit changes');
      expect(error.details).toBe('git commit failed');
      expect(error.metadata.code).toBe(1);
      expect(error.metadata.command).toBe('git commit -m "test"');
    });
  });

  describe('ValidationError', () => {
    it('should create a properly formatted validation error', () => {
      const error = new ValidationError('Invalid commit message', 'commitMessage');

      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid commit message');
      expect(error.field).toBe('commitMessage');
    });
  });

  describe('ConfigError', () => {
    it('should create a properly formatted config error', () => {
      const error = new ConfigError('Invalid configuration', '/path/to/config');

      expect(error.name).toBe('ConfigError');
      expect(error.message).toBe('Invalid configuration');
      expect(error.configPath).toBe('/path/to/config');
    });
  });

  describe('createErrorHandler', () => {
    it('should create an error handler that properly categorizes Git errors', () => {
      const errorHandler = createErrorHandler();

      const gitError = new GitError('no changes added to commit', 'git error', { code: 1 });
      const result = errorHandler.handleError(gitError);

      expect(result.type).toBe('git');
      expect(result.message).toBe('no changes added to commit');
      expect(result.recoverable).toBe(true);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should create an error handler that properly categorizes validation errors', () => {
      const errorHandler = createErrorHandler();

      const validationError = new ValidationError('Invalid message', 'commitMessage');
      const result = errorHandler.handleError(validationError);

      expect(result.type).toBe('validation');
      expect(result.message).toBe('Invalid message');
      expect(result.details).toContain('commitMessage');
      expect(result.recoverable).toBe(true);
    });

    it('should create an error handler that properly categorizes config errors', () => {
      const errorHandler = createErrorHandler();

      const configError = new ConfigError('Invalid config', '/path/to/config');
      const result = errorHandler.handleError(configError);

      expect(result.type).toBe('config');
      expect(result.message).toBe('Invalid config');
      expect(result.details).toContain('/path/to/config');
      expect(result.recoverable).toBe(true);
    });

    it('should handle unknown errors', () => {
      const errorHandler = createErrorHandler();

      const genericError = new Error('Something went wrong');
      const result = errorHandler.handleError(genericError);

      expect(result.type).toBe('unknown');
      expect(result.message).toContain('Something went wrong');
      expect(result.recoverable).toBe(false);
    });

    it('should provide appropriate suggestions for Git repository errors', () => {
      const errorHandler = createErrorHandler();

      const gitError = new GitError(
        'Not a git repository',
        'fatal: not a git repository (or any of the parent directories): .git',
        { command: 'git status' },
      );
      const result = errorHandler.handleError(gitError);

      expect(result.suggestions).toContain('Make sure you are in a Git repository');
      expect(result.suggestions).toContain('Run "git init" to initialize a new repository');
    });

    it('should provide appropriate suggestions for no staged changes errors', () => {
      const errorHandler = createErrorHandler();

      const gitError = new GitError(
        'No changes added to commit',
        'no changes added to commit (use "git add" and/or "git commit -a")',
        { command: 'git commit' },
      );
      const result = errorHandler.handleError(gitError);

      expect(result.suggestions).toContain('Stage changes with "git add <file>" before committing');
    });
  });
});
