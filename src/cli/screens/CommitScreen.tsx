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
    // Show confirmation dialog when the commit message is ready
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    // This would normally call the Git operations to create the commit
    console.log('Creating commit with message:', commitMessage);

    // Reset state or navigate to success screen
    setCommitMessage('');
    setShowConfirmation(false);
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
        onComplete={handleCommitComplete}
      />
    </Box>
  );
};

export default CommitScreen;
