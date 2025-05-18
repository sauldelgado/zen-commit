import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { PatternMatch } from '../../core/patterns/pattern-detection';

export interface WarningPanelProps {
  warnings: PatternMatch[];
  onDismiss: () => void;
  onDismissPattern: (patternId: string) => void;
}

/**
 * Component for displaying warnings with interaction controls
 */
const WarningPanel: React.FC<WarningPanelProps> = ({ warnings, onDismiss, onDismissPattern }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWarningIndex, setSelectedWarningIndex] = useState(0);

  // Handle keyboard input
  useInput((input, key) => {
    if (warnings.length === 0) return;

    if (key.return) {
      // Toggle details display
      setShowDetails(!showDetails);
    } else if (key.escape) {
      if (showDetails) {
        // If showing details, go back to summary
        setShowDetails(false);
      } else {
        // Otherwise dismiss all warnings
        onDismiss();
      }
    } else if (input === 'd') {
      // Dismiss all warnings
      onDismiss();
    } else if (input === 'p' && showDetails && warnings.length > 0) {
      // Permanently dismiss selected pattern
      const patternId = warnings[selectedWarningIndex].patternId;
      onDismissPattern(patternId);
    } else if (key.upArrow && showDetails) {
      // Navigate to previous warning
      setSelectedWarningIndex((prev) => (prev > 0 ? prev - 1 : warnings.length - 1));
    } else if (key.downArrow && showDetails) {
      // Navigate to next warning
      setSelectedWarningIndex((prev) => (prev < warnings.length - 1 ? prev + 1 : 0));
    }
  });

  // If no warnings, don't render anything
  if (warnings.length === 0) {
    return null;
  }

  // Render summary or detailed view
  return (
    <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
      {showDetails ? (
        // Detailed view
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text bold>
              {warnings.length === 1 ? '1 issue detected' : `${warnings.length} issues detected`}
            </Text>
          </Box>

          <Box flexDirection="column" marginBottom={1}>
            {warnings.map((warning, index) => (
              <Box key={index} flexDirection="column" marginBottom={1}>
                <Box>
                  <Text
                    color={warning.severity}
                    bold={index === selectedWarningIndex}
                    underline={index === selectedWarningIndex}
                  >
                    {index === selectedWarningIndex ? '▶ ' : '  '}
                    {warning.name}
                  </Text>
                </Box>

                {index === selectedWarningIndex && (
                  <Box flexDirection="column" marginLeft={4}>
                    <Text>{warning.description}</Text>

                    {warning.matchedText && (
                      <Box marginTop={1}>
                        <Text dimColor>Matched: "</Text>
                        <Text color={warning.severity}>{warning.matchedText}</Text>
                        <Text dimColor>"</Text>
                      </Box>
                    )}

                    {warning.suggestion && (
                      <Box marginTop={1}>
                        <Text bold>Suggestion: </Text>
                        <Text>{warning.suggestion}</Text>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ))}
          </Box>

          <Box marginTop={1}>
            <Text dimColor>
              ↑/↓: Navigate | Esc: Back | D: Dismiss all | P: Permanently dismiss pattern
            </Text>
          </Box>
        </Box>
      ) : (
        // Summary view
        <Box flexDirection="column">
          <Box>
            <Text color="yellow">
              ⚠{' '}
              {warnings.length === 1
                ? '1 issue detected in commit message'
                : `${warnings.length} issues detected in commit message`}
            </Text>
          </Box>

          <Box marginTop={1}>
            <Text dimColor>Enter: Show details | Esc: Dismiss | D: Dismiss all</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default WarningPanel;
