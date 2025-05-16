import React from 'react';
import { Box, Text, ConfirmationDialog } from '@ui/components';

interface StagedFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied';
}

interface CommitConfirmationScreenProps {
  commitMessage: string;
  stagedFiles: StagedFile[];
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Screen that shows a confirmation before finalizing a commit
 */
const CommitConfirmationScreen: React.FC<CommitConfirmationScreenProps> = ({
  commitMessage,
  stagedFiles,
  onConfirm,
  onCancel,
}) => {
  // Create content to show in the confirmation dialog
  const content = (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Commit Message:</Text>
      </Box>

      <Box marginBottom={1} paddingLeft={2}>
        <Text>{commitMessage}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold>Staged Files ({stagedFiles.length}):</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
        {stagedFiles.map((file, index) => (
          <Box key={index}>
            <Text color={getStatusColor(file.status)}>
              {getStatusSymbol(file.status)} {file.path}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <ConfirmationDialog
      title="Confirm Commit"
      message="Are you sure you want to create this commit?"
      onConfirm={onConfirm}
      onCancel={onCancel}
      content={content}
      confirmText="Commit"
      cancelText="Cancel"
    />
  );
};

/**
 * Get color for file status
 */
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'added':
      return 'green';
    case 'deleted':
      return 'red';
    case 'modified':
      return 'yellow';
    case 'renamed':
    case 'copied':
      return 'blue';
    default:
      return 'white';
  }
};

/**
 * Get symbol for file status
 */
const getStatusSymbol = (status: string): string => {
  switch (status) {
    case 'added':
      return 'A';
    case 'deleted':
      return 'D';
    case 'modified':
      return 'M';
    case 'renamed':
      return 'R';
    case 'copied':
      return 'C';
    default:
      return '?';
  }
};

export type { CommitConfirmationScreenProps, StagedFile };
export default CommitConfirmationScreen;
