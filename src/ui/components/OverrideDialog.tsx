import React, { useState } from 'react';
import { Box, Text } from './';
import { useInput } from 'ink';
import TextInput from 'ink-text-input';
import { PatternMatch } from '../../core/patterns/pattern-detection';

export interface OverrideDialogProps {
  warning: PatternMatch;
  onOverride: (patternId: string, reason: string, isPermanent: boolean) => void;
  onCancel: () => void;
  allowPermanentOverride?: boolean;
}

/**
 * Component for overriding a warning
 */
const OverrideDialog: React.FC<OverrideDialogProps> = ({
  warning,
  onOverride,
  onCancel,
  allowPermanentOverride = false,
}) => {
  const [reason, setReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);
  const [focusedElement, setFocusedElement] = useState<
    'reason' | 'permanent' | 'submit' | 'cancel'
  >('reason');

  // Handle keyboard input
  useInput((_, key) => {
    if (key.escape) {
      onCancel();
    } else if (key.tab) {
      // Cycle through focusable elements
      if (focusedElement === 'reason') {
        setFocusedElement(allowPermanentOverride ? 'permanent' : 'submit');
      } else if (focusedElement === 'permanent') {
        setFocusedElement('submit');
      } else if (focusedElement === 'submit') {
        setFocusedElement('cancel');
      } else if (focusedElement === 'cancel') {
        setFocusedElement('reason');
      }
    } else if (key.return) {
      if (focusedElement === 'permanent') {
        setIsPermanent(!isPermanent);
      } else if (focusedElement === 'submit') {
        // Only allow override with a non-empty reason
        if (reason.trim().length > 0) {
          onOverride(warning.patternId, reason, isPermanent);
        }
      } else if (focusedElement === 'cancel') {
        onCancel();
      }
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="yellow" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Override Warning: {warning.name}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>{warning.description}</Text>
      </Box>

      {warning.matchedText && (
        <Box marginBottom={1}>
          <Text dimColor>Matched: "</Text>
          <Text color="yellow">{warning.matchedText}</Text>
          <Text dimColor>"</Text>
        </Box>
      )}

      <Box marginBottom={1}>
        <Text bold>Reason for override:</Text>
      </Box>

      <Box marginBottom={1}>
        {focusedElement === 'reason' ? (
          <TextInput
            value={reason}
            onChange={setReason}
            placeholder="Enter reason for override..."
            onSubmit={() => setFocusedElement(allowPermanentOverride ? 'permanent' : 'submit')}
          />
        ) : (
          <Text>{reason || <Text dimColor>(No reason provided)</Text>}</Text>
        )}
      </Box>

      {allowPermanentOverride && (
        <Box marginBottom={1}>
          <Box marginRight={1}>
            <Text bold={focusedElement === 'permanent'}>
              {focusedElement === 'permanent' ? '> ' : ' '}[{isPermanent ? 'X' : ' '}]
            </Text>
          </Box>
          <Text>Make this override permanent</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Box marginRight={2}>
          <Text
            bold={focusedElement === 'submit'}
            backgroundColor={focusedElement === 'submit' ? 'green' : undefined}
            color={focusedElement === 'submit' ? 'white' : 'green'}
          >
            [ Override ]
          </Text>
        </Box>

        <Box>
          <Text
            bold={focusedElement === 'cancel'}
            backgroundColor={focusedElement === 'cancel' ? 'red' : undefined}
            color={focusedElement === 'cancel' ? 'white' : 'red'}
          >
            [ Cancel ]
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Tab: Navigate | Enter: Select | Esc: Cancel</Text>
      </Box>
    </Box>
  );
};

export default OverrideDialog;
