import React, { useState, useEffect } from 'react';
import { Box } from '@ui/components';
import { CommitMessageInput, ConventionalCommitForm, ErrorMessage, Text } from '@ui/components';
import { CommitConfirmationScreen, CommitSuccessScreen } from '@cli/screens';
import type { StagedFile } from './CommitConfirmationScreen';
import { createGitOperations } from '@git/operations';
import { mapGitStatusToStagedFiles } from '@git/utils';
import { createErrorHandler } from '@utils/errors';
import type { ErrorResult } from '@utils/error-types';

/**
 * Main screen for creating a commit
 */
const CommitScreen: React.FC = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [error, setError] = useState<ErrorResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commitHash, setCommitHash] = useState('');
  const [branchName, setBranchName] = useState('');
  const [hasRemote, setHasRemote] = useState(false);
  // In a real implementation, we would toggle this with keyboard input
  const [useConventionalCommit] = useState(false);

  // Initialize git operations and error handler
  const gitOperations = createGitOperations(process.cwd());
  const errorHandler = createErrorHandler();

  // Load staged files and branch info when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load staged files
        const status = await gitOperations.getStatus();
        const mappedFiles = mapGitStatusToStagedFiles(status);
        setStagedFiles(mappedFiles);

        // Load branch info
        const branch = await gitOperations.getCurrentBranch();
        setBranchName(branch);

        const hasTracking = await gitOperations.hasRemoteTracking();
        setHasRemote(hasTracking);
      } catch (err) {
        // Handle error loading data
        setError(errorHandler.handleError(err as Error));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCommitComplete = () => {
    // Validate that we have a non-empty commit message before showing confirmation
    const trimmedMessage = commitMessage.trim();

    if (!trimmedMessage) {
      setError(errorHandler.handleError(new Error('Commit message cannot be empty')));
      return;
    }

    // Show confirmation dialog when the commit message is ready
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    try {
      // Call Git operations to create the commit
      const result = await gitOperations.createCommit(commitMessage);

      // Store commit hash
      setCommitHash(result.commitHash);

      // Close confirmation screen and show success screen
      setShowConfirmation(false);
      setShowSuccess(true);

      // Reload staged files to refresh the UI when success is dismissed
      const status = await gitOperations.getStatus();
      const mappedFiles = mapGitStatusToStagedFiles(status);
      setStagedFiles(mappedFiles);

      // Clear error state
      setError(null);
    } catch (err) {
      // Handle Git operation errors
      setError(errorHandler.handleError(err as Error));
      setShowConfirmation(false);
    }
  };

  const handleCancel = () => {
    // Go back to editing the commit message
    setShowConfirmation(false);
  };

  const handleSuccessDismiss = () => {
    // Clear success screen and reset commit message
    setShowSuccess(false);
    setCommitMessage('');
  };

  const handleErrorDismiss = () => {
    setError(null);
  };

  const handleErrorRetry = () => {
    setError(null);
    if (showConfirmation) {
      // If we were in the confirmation screen when error occurred,
      // we should retry the commit operation
      handleConfirm();
    } else {
      // Otherwise, just reload the staged files
      gitOperations
        .getStatus()
        .then((status) => {
          const mappedFiles = mapGitStatusToStagedFiles(status);
          setStagedFiles(mappedFiles);
        })
        .catch((err) => {
          setError(errorHandler.handleError(err as Error));
        });
    }
  };

  // Show error message if there is one
  if (error) {
    return (
      <ErrorMessage
        error={error}
        onDismiss={handleErrorDismiss}
        onRetry={error.recoverable ? handleErrorRetry : undefined}
      />
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box>
        <Box marginRight={1}>Loading staged changes...</Box>
      </Box>
    );
  }

  // Show success screen after commit
  if (showSuccess) {
    return (
      <CommitSuccessScreen
        commitHash={commitHash}
        commitMessage={commitMessage}
        branchName={branchName}
        hasRemote={hasRemote}
        onDismiss={handleSuccessDismiss}
      />
    );
  }

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

  // For now, let's just offer a toggle message instead of key handling
  // We'll need a more robust key input solution that works in the tests

  // Otherwise show the commit message input or conventional commit form
  return (
    <Box flexDirection="column">
      {/* Toggle for conventional commits */}
      <Box marginBottom={1}>
        <Text>Use Conventional Commits: </Text>
        <Text color={useConventionalCommit ? 'green' : 'gray'}>
          {useConventionalCommit ? 'Yes' : 'No'}
        </Text>
        <Text dimColor> (Press 'c' to toggle)</Text>
      </Box>

      {useConventionalCommit ? (
        <ConventionalCommitForm
          value={commitMessage}
          onChange={setCommitMessage}
          onSubmit={handleCommitComplete}
        />
      ) : (
        <CommitMessageInput
          value={commitMessage}
          onChange={setCommitMessage}
          showSubjectBodySeparation
          onSubmit={handleCommitComplete}
          conventionalCommit={false}
        />
      )}
    </Box>
  );
};

export default CommitScreen;
