import React from 'react';
import { Box, Text, ConfirmationDialog } from '@ui/components';

/**
 * Represents a file that has been staged for commit in Git
 *
 * @interface StagedFile
 * @property {string} path - The relative path to the file from the repository root
 * @property {'modified' | 'added' | 'deleted' | 'renamed' | 'copied'} status - The Git status of the file
 */
interface StagedFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied';
}

/**
 * Properties for the CommitConfirmationScreen component
 *
 * @interface CommitConfirmationScreenProps
 * @property {string} commitMessage - The commit message text to be confirmed
 * @property {StagedFile[]} stagedFiles - Array of files that will be included in the commit
 * @property {() => void} onConfirm - Function called when the user confirms the commit
 * @property {() => void} onCancel - Function called when the user cancels the commit
 */
interface CommitConfirmationScreenProps {
  commitMessage: string;
  stagedFiles: StagedFile[];
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Screen component that shows a confirmation dialog before finalizing a Git commit.
 * Displays the commit message and a list of staged files for review.
 *
 * @remarks
 * This component handles long commit messages by truncating them if necessary,
 * and limits the number of files displayed to prevent terminal overflow.
 *
 * @example
 * ```tsx
 * <CommitConfirmationScreen
 *   commitMessage="feat: implement new feature"
 *   stagedFiles={[{ path: 'src/file.ts', status: 'modified' }]}
 *   onConfirm={() => console.log('Commit confirmed')}
 *   onCancel={() => console.log('Commit cancelled')}
 * />
 * ```
 */
const CommitConfirmationScreen: React.FC<CommitConfirmationScreenProps> = ({
  commitMessage,
  stagedFiles,
  onConfirm,
  onCancel,
}) => {
  // Handle long commit messages by truncating if needed
  const formatCommitMessage = (message: string): string => {
    const MAX_LINE_LENGTH = 80;
    const lines = message.split('\n');

    return lines
      .map((line) => {
        if (line.length <= MAX_LINE_LENGTH) return line;

        // Truncate long lines with ellipsis
        return line.substring(0, MAX_LINE_LENGTH - 3) + '...';
      })
      .join('\n');
  };

  // Limit the number of files shown to prevent terminal overflow
  const MAX_FILES_TO_SHOW = 15;
  const visibleFiles = stagedFiles.slice(0, MAX_FILES_TO_SHOW);
  const hiddenFilesCount = Math.max(0, stagedFiles.length - MAX_FILES_TO_SHOW);

  // Create content to show in the confirmation dialog
  const content = (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Commit Message:</Text>
      </Box>

      <Box marginBottom={1} paddingLeft={2}>
        <Text>{formatCommitMessage(commitMessage)}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text bold>Staged Files ({stagedFiles.length}):</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1} paddingLeft={2}>
        {visibleFiles.map((file, index) => (
          <Box key={index}>
            <Text color={getStatusColor(file.status)}>
              {getStatusSymbol(file.status)} {file.path}
            </Text>
          </Box>
        ))}

        {hiddenFilesCount > 0 && (
          <Box>
            <Text dimColor>
              ... and {hiddenFilesCount} more file{hiddenFilesCount !== 1 ? 's' : ''}
            </Text>
          </Box>
        )}
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
 * Union type representing possible Git file statuses
 * Includes string to allow for future or custom statuses
 */
type FileStatus = 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | string;

/**
 * Maps a Git file status to a color for display
 *
 * @param {FileStatus} status - The Git status of the file
 * @returns {string} A color name suitable for use with the Text component
 *
 * @example
 * ```tsx
 * <Text color={getStatusColor('modified')}>File was modified</Text>
 * ```
 */
const getStatusColor = (status: FileStatus): string => {
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
 * Maps a Git file status to a single character symbol
 *
 * @param {FileStatus} status - The Git status of the file
 * @returns {string} A single character representing the status
 *
 * @remarks
 * Uses standard Git symbols:
 * - A: Added
 * - D: Deleted
 * - M: Modified
 * - R: Renamed
 * - C: Copied
 * - ?: Unknown/other status
 */
const getStatusSymbol = (status: FileStatus): string => {
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
