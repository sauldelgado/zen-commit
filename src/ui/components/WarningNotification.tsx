import React from 'react';
import { Box, Text } from 'ink';
import { PatternMatch, PatternSeverity } from '../../core/patterns/pattern-detection';
import { useInput } from 'ink';

export interface WarningNotificationProps {
  warnings: PatternMatch[];
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * Component for displaying warnings and issues detected in commit messages
 */
const WarningNotification: React.FC<WarningNotificationProps> = ({
  warnings,
  dismissible = false,
  onDismiss,
}) => {
  // Handle keyboard input for dismissal
  useInput((_, key) => {
    if (dismissible && onDismiss && key.escape) {
      onDismiss();
    }
  });

  // If no warnings, don't render anything
  if (warnings.length === 0) {
    return null;
  }

  // Get color for severity level
  const getSeverityColor = (severity: PatternSeverity): string => {
    switch (severity) {
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'info':
      default:
        return 'blue';
    }
  };

  // Get icon for severity level
  const getSeverityIcon = (severity: PatternSeverity): string => {
    switch (severity) {
      case 'error':
        return '✖';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
      <Box marginBottom={1}>
        <Text bold>
          {warnings.length === 1
            ? '1 issue detected in commit message'
            : `${warnings.length} issues detected in commit message`}
        </Text>
      </Box>

      {warnings.map((warning, index) => (
        <Box key={index} flexDirection="column" marginBottom={1}>
          <Box>
            <Text color={getSeverityColor(warning.severity)}>
              {getSeverityIcon(warning.severity)} {warning.name}
            </Text>
          </Box>

          <Box marginLeft={2}>
            <Text>{warning.description}</Text>
          </Box>

          {warning.matchedText && (
            <Box marginLeft={2}>
              <Text dimColor>Matched: "</Text>
              <Text color={getSeverityColor(warning.severity)}>{warning.matchedText}</Text>
              <Text dimColor>"</Text>
            </Box>
          )}

          {warning.suggestion && (
            <Box marginLeft={2}>
              <Text bold>Suggestion: </Text>
              <Text>{warning.suggestion}</Text>
            </Box>
          )}
        </Box>
      ))}

      {dismissible && (
        <Box marginTop={1}>
          <Text dimColor>Press Esc to dismiss</Text>
        </Box>
      )}
    </Box>
  );
};

export default WarningNotification;
