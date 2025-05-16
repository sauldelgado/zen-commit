import { GitError } from '@git/errors';
import { GitErrorType } from '@git/types';
import { ValidationError, ConfigError, createErrorHandler } from '@utils/errors';

// Mock the underlying SelectInput component to avoid implementation details in tests
jest.mock('ink-select-input', () => {
  const React = require('react');
  return function MockSelectInput(props: { items: Array<{ label: string }> }): JSX.Element {
    return React.createElement(
      'div',
      { 'data-testid': 'select-input' },
      JSON.stringify(props.items.map((item) => item.label)),
    );
  };
});

/**
 * This test suite demonstrates the error propagation flow in the application:
 *
 * 1. An error occurs in a lower-level module (git, validation, etc.)
 * 2. It gets processed by the error handler
 * 3. The resulting ErrorResult is displayed to the user via the ErrorMessage component
 */
describe('Error Handling Integration', () => {
  /**
   * Create standard mocks for our tests
   */
  const setup = () => {
    const errorHandler = createErrorHandler();

    return {
      errorHandler,
    };
  };

  /**
   * Test error propagation through the system
   */
  describe('Error Flow', () => {
    it('should correctly process different error types', () => {
      const { errorHandler } = setup();

      // Test each error type

      // 1. Git error
      const gitError = new GitError('Failed to commit changes', GitErrorType.COMMAND_ERROR);
      const gitErrorResult = errorHandler.handleError(gitError);

      expect(gitErrorResult.type).toBe('git');
      expect(gitErrorResult.message).toBe('Failed to commit changes');
      expect(gitErrorResult.suggestions.length).toBeGreaterThan(0);

      // 2. Validation error
      const validationError = new ValidationError(
        'Commit message cannot be empty',
        'commitMessage',
      );
      const validationErrorResult = errorHandler.handleError(validationError);

      expect(validationErrorResult.type).toBe('validation');
      expect(validationErrorResult.message).toBe('Commit message cannot be empty');
      expect(validationErrorResult.recoverable).toBe(true);
      expect(validationErrorResult.suggestions).toContain(
        'Validation failed for field: commitMessage',
      );

      // 3. Config error
      const configError = new ConfigError('Invalid configuration format', '/path/to/config.json');
      const configErrorResult = errorHandler.handleError(configError);

      expect(configErrorResult.type).toBe('config');
      expect(configErrorResult.message).toBe('Invalid configuration format');
      expect(configErrorResult.recoverable).toBe(true);

      // 4. Unknown error
      const unknownError = new Error('Unexpected error in application');
      const unknownErrorResult = errorHandler.handleError(unknownError);

      expect(unknownErrorResult.type).toBe('unknown');
      expect(unknownErrorResult.message).toBe('Unexpected error in application');
      expect(unknownErrorResult.recoverable).toBe(false);
    });
  });

  /**
   * Test error recovery paths
   */
  describe('Error Recovery', () => {
    it('should detect and handle recoverable errors', () => {
      const { errorHandler } = setup();

      // Test recoverable errors by type
      const validationError = new ValidationError('Invalid input', 'field');
      const validationResult = errorHandler.handleError(validationError);
      expect(validationResult.recoverable).toBe(true);

      const configError = new ConfigError('Invalid config format', '/config.json');
      const configResult = errorHandler.handleError(configError);
      expect(configResult.recoverable).toBe(true);

      // GitError recoverable check
      const gitError = new GitError('no changes added to commit', GitErrorType.COMMAND_ERROR);
      const gitResult = errorHandler.handleError(gitError);
      expect(gitResult.recoverable).toBe(true);

      // Test non-recoverable error
      const nonRecoverableError = new Error('Fatal system error');
      const unknownResult = errorHandler.handleError(nonRecoverableError);
      expect(unknownResult.recoverable).toBe(false);
    });
  });
});
