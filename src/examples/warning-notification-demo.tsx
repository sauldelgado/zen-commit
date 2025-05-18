import React, { useState } from 'react';
import { render, Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { WarningPanel } from '../ui/components';
import { createPatternMatcher } from '../core/patterns/pattern-matcher';
import { createWarningManager } from '../core/patterns/warning-manager';

/**
 * Demo component to showcase the warning notification system
 */
const WarningNotificationDemo = () => {
  const [value, setValue] = useState('');
  const [showWarnings, setShowWarnings] = useState(true);

  // Initialize pattern matcher and warning manager
  const patternMatcher = React.useMemo(() => createPatternMatcher({ includeBuiltIn: true }), []);
  const warningManager = React.useMemo(() => createWarningManager(), []);

  // Analyze the message for patterns
  React.useEffect(() => {
    const analysis = patternMatcher.analyzeMessage(value);
    warningManager.setWarnings(analysis.matches);
  }, [value, patternMatcher, warningManager]);

  // Get current warnings
  const currentWarnings = warningManager.getWarnings();

  // Handle dismissing all warnings
  const handleDismissWarnings = () => {
    setShowWarnings(false);
  };

  // Handle permanently dismissing a pattern
  const handleDismissPattern = (patternId: string) => {
    warningManager.persistentlyDismissPattern(patternId);
    patternMatcher.disablePattern(patternId);
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Warning Notification System Demo</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Type a commit message below to see warnings:</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Tip: Try typing "WIP: Work in progress" or "Fixup: Temporary fix"</Text>
      </Box>

      <Box marginY={1}>
        <TextInput value={value} onChange={setValue} placeholder="Enter a commit message..." />
      </Box>

      {/* Display warnings if there are any */}
      {showWarnings && currentWarnings.length > 0 && (
        <Box marginTop={1}>
          <WarningPanel
            warnings={currentWarnings}
            onDismiss={handleDismissWarnings}
            onDismissPattern={handleDismissPattern}
          />
        </Box>
      )}

      {!showWarnings && (
        <Box marginTop={1}>
          <Text>Warnings have been dismissed. Refresh the demo to see them again.</Text>
          <Box marginTop={1}>
            <Text>Currently dismissed patterns:</Text>
            {/* Note: We currently can't get the list of disabled patterns directly */}
            <Box marginLeft={2}>
              <Text dimColor>- Permanently dismissed patterns are stored internally</Text>
            </Box>
          </Box>
        </Box>
      )}

      <Box marginTop={2}>
        <Text dimColor>
          Interaction guide: Enter: Show warning details | Esc: Dismiss | D: Dismiss all | P:
          Permanently dismiss pattern
        </Text>
      </Box>
    </Box>
  );
};

/**
 * Render the warning notification demo
 */
render(<WarningNotificationDemo />);
