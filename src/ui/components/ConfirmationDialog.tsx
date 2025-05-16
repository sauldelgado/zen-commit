import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useInput } from 'ink';

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
}

/**
 * A dialog component that asks for confirmation before proceeding with an action
 */
const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  content,
  confirmText = 'Yes',
  cancelText = 'No',
}) => {
  // Define options for the select input
  const items = [
    { label: confirmText, value: 'confirm' },
    { label: cancelText, value: 'cancel' },
  ];

  // Handle keyboard shortcuts
  useInput((input, key) => {
    if (input === 'y' || input === 'Y') {
      onConfirm();
    } else if (input === 'n' || input === 'N' || key.escape) {
      onCancel();
    }
  });

  // Handle selection from the select input
  const handleSelect = (item: { label: string; value: string }) => {
    if (item.value === 'confirm') {
      onConfirm();
    } else {
      onCancel();
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" padding={1}>
      <Box marginBottom={1}>
        <Text bold>{title}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>{message}</Text>
      </Box>

      {content && (
        <Box marginBottom={1} flexDirection="column">
          {content}
        </Box>
      )}

      <Box marginTop={1}>
        <SelectInput items={items} onSelect={handleSelect} />
      </Box>

      <Box marginTop={1}>
        <Text dimColor>Press Y/y to confirm, N/n or Esc to cancel</Text>
      </Box>
    </Box>
  );
};

export type { ConfirmationDialogProps };
export default ConfirmationDialog;
