import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { ErrorResult } from '@utils/error-types';

/**
 * Props for the ErrorMessage component
 */
export interface ErrorMessageProps {
  /** The error result object containing error details */
  error: ErrorResult;

  /** Function called when the user dismisses the error message */
  onDismiss: () => void;

  /** Optional function called when the user chooses to retry the operation */
  onRetry?: () => void;
}

/**
 * Component for displaying error messages with suggestions and actions
 *
 * This component shows a formatted error message with appropriate styling based on
 * the error type. It displays the error message, error type, optional details,
 * and suggestions for resolving the error. It also provides action buttons that
 * allow the user to retry (if the error is recoverable) or dismiss the error.
 *
 * Error types are visually distinguished by color:
 * - git errors: yellow
 * - validation errors: blue
 * - config errors: magenta
 * - other/unknown errors: red
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   error={{
 *     type: 'git',
 *     message: 'Failed to commit changes',
 *     details: 'No changes added to commit',
 *     suggestions: ['Stage changes with git add'],
 *     recoverable: true
 *   }}
 *   onDismiss={() => setShowError(false)}
 *   onRetry={() => retryOperation()}
 * />
 * ```
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, onDismiss, onRetry }) => {
  // Determine error color based on type
  const getErrorColor = (type: string): string => {
    switch (type) {
      case 'git':
        return 'yellow';
      case 'validation':
        return 'blue';
      case 'config':
        return 'magenta';
      default:
        return 'red';
    }
  };

  // Create actions based on error type and recoverability
  const actions = [];

  if (error.recoverable && onRetry) {
    actions.push({
      label: 'Retry',
      value: 'retry',
    });
  }

  actions.push({
    label: 'Dismiss',
    value: 'dismiss',
  });

  const handleSelect = (item: { label: string; value: string }) => {
    if (item.value === 'retry' && onRetry) {
      onRetry();
    } else {
      onDismiss();
    }
  };

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={getErrorColor(error.type)}
      padding={1}
      width={80}
    >
      <Box marginBottom={1}>
        <Text bold color={getErrorColor(error.type)}>
          Error: {error.message}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Error Type: {error.type}</Text>
      </Box>

      {error.details && (
        <Box marginBottom={1}>
          <Text dimColor>{error.details}</Text>
        </Box>
      )}

      {error.suggestions.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>Suggestions:</Text>
          {error.suggestions.map((suggestion: string, index: number) => (
            <Text key={index}> • {suggestion}</Text>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <SelectInput items={actions} onSelect={handleSelect} />
      </Box>
    </Box>
  );
};

export default ErrorMessage;
