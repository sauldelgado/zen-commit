import React, { ReactNode } from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { useInput } from 'ink';

/**
 * Properties for the ConfirmationDialog component
 *
 * @interface ConfirmationDialogProps
 * @property {string} title - The title displayed at the top of the dialog
 * @property {string} message - The main message/question asking for confirmation
 * @property {() => void} onConfirm - Function called when the user confirms the action
 * @property {() => void} onCancel - Function called when the user cancels the action
 * @property {ReactNode} [content] - Optional content to display between the message and buttons
 * @property {string} [confirmText="Yes"] - Custom text for the confirm button
 * @property {string} [cancelText="No"] - Custom text for the cancel button
 */
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
 * A dialog component that asks for confirmation before proceeding with an action.
 * Provides buttons for confirmation and cancellation, as well as keyboard shortcuts.
 *
 * @example
 * ```tsx
 * <ConfirmationDialog
 *   title="Confirm Action"
 *   message="Are you sure you want to proceed?"
 *   onConfirm={() => console.log('Confirmed')}
 *   onCancel={() => console.log('Cancelled')}
 * />
 * ```
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

  // Define the item type for SelectInput
  interface SelectItem {
    label: string;
    value: string;
  }

  // Handle selection from the select input
  const handleSelect = (item: SelectItem): void => {
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
