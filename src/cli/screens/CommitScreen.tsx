import React, { useState } from 'react';
import { Box } from '@ui/components';
import { CommitMessageInput } from '@ui/components';
import { CommitConfirmationScreen } from '@cli/screens';
import type { StagedFile } from './CommitConfirmationScreen';

/**
 * Main screen for creating a commit
 */
const CommitScreen: React.FC = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  // This would normally come from the Git operations interface
  const stagedFiles: StagedFile[] = [
    { path: 'src/index.ts', status: 'modified' },
    { path: 'src/components/Button.tsx', status: 'added' },
    { path: 'README.md', status: 'modified' },
  ];

  const handleCommitComplete = () => {
    // Validate that we have a non-empty commit message before showing confirmation
    const trimmedMessage = commitMessage.trim();

    if (!trimmedMessage) {
      console.error('Error: Commit message cannot be empty');
      return;
    }

    // Show confirmation dialog when the commit message is ready
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      // This would normally call the Git operations to create the commit
      console.log('Creating commit with message:', commitMessage);

      // In a real implementation, we would have something like:
      // await gitOperations.commit(commitMessage);

      // Reset state or navigate to success screen
      setCommitMessage('');
      setShowConfirmation(false);

      // Show success message in a real implementation
      // For demo purposes, we just log to console
      console.log('Commit successful!');
    } catch (error) {
      // Handle Git operation errors
      console.error('Failed to create commit:', error);

      // In a real implementation, we would display an error message to the user
      // and possibly allow them to retry

      // Go back to editing the commit message
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    // Go back to editing the commit message
    setShowConfirmation(false);
  };

  // Show confirmation screen if requested
  if (showConfirmation) {
    return (
      <CommitConfirmationScreen
        commitMessage={commitMessage}
        stagedFiles={stagedFiles}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  }

  // Otherwise show the commit message input
  return (
    <Box flexDirection="column">
      <CommitMessageInput
        value={commitMessage}
        onChange={setCommitMessage}
        showSubjectBodySeparation
        onSubmit={handleCommitComplete}
      />
    </Box>
  );
};

export default CommitScreen;
