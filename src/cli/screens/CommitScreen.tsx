import React, { useState, useEffect } from 'react';
import { Box } from '@ui/components';
import {
  CommitMessageInput,
  ConventionalCommitForm,
  ErrorMessage,
  Text,
  TemplateBrowser,
} from '@ui/components';
import { CommitConfirmationScreen, CommitSuccessScreen } from '@cli/screens';
import type { StagedFile } from './CommitConfirmationScreen';
import { createGitOperations } from '@git/operations';
import { mapGitStatusToStagedFiles } from '@git/utils';
import { createErrorHandler } from '@utils/errors';
import type { ErrorResult } from '@utils/error-types';
import { createTemplateManager } from '@core/template-manager';
import path from 'path';

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
  const [useConventionalCommit, setUseConventionalCommit] = useState(false);
  const [useTemplates, setUseTemplates] = useState(false);

  // Initialize git operations and error handler
  const gitOperations = createGitOperations(process.cwd());
  const errorHandler = createErrorHandler();

  // Initialize template manager
  const templateManager = createTemplateManager({
    userTemplatesDir: path.join(process.env.HOME || '', '.zen-commit/templates'),
    builtInTemplatesDir: path.join(__dirname, '../../src/core/templates'),
  });

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

  // Handle template completion
  const handleTemplateComplete = (message: string) => {
    setCommitMessage(message);
    setUseTemplates(false);
  };

  // Handle template cancellation
  const handleTemplateCancel = () => {
    setUseTemplates(false);
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

  // Handle keyboard input for toggling modes
  useEffect(() => {
    let isActive = true;

    // Using process.stdin directly for keyboard input
    const handleKeyPress = (
      _str: string,
      key: { name: string; ctrl: boolean; meta: boolean; shift: boolean },
    ) => {
      if (!isActive) return;

      // Toggle conventional commit mode when 'c' is pressed
      if (key.name === 'c' && !key.ctrl && !key.meta) {
        setUseConventionalCommit((prev) => !prev);
        // Turn off templates mode if conventional commits is enabled
        if (!useConventionalCommit) {
          setUseTemplates(false);
        }
      }
      // Toggle templates mode when 't' is pressed
      else if (key.name === 't' && !key.ctrl && !key.meta) {
        setUseTemplates((prev) => !prev);
        // Turn off conventional commits mode if templates is enabled
        if (!useTemplates) {
          setUseConventionalCommit(false);
        }
      }
    };

    try {
      // Register keypress handler if we have access to stdin and it's a TTY
      if (process.stdin.isTTY) {
        // Make sure raw mode is enabled to capture individual keypresses
        if (process.stdin.setRawMode) {
          process.stdin.setRawMode(true);
        }

        // Handle keypress events
        process.stdin.on('keypress', handleKeyPress);
      }
    } catch (err) {
      // Silently handle errors - this might happen in test environments
      // or when no TTY is available
    }

    // Clean up event listener when component unmounts
    return () => {
      isActive = false;
      try {
        if (process.stdin.isTTY) {
          process.stdin.off('keypress', handleKeyPress);
        }
      } catch (err) {
        // Silently handle cleanup errors
      }
    };
  }, [useConventionalCommit, useTemplates]);

  // Show template browser if templates mode is enabled
  if (useTemplates) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Template Selection</Text>
        </Box>
        <TemplateBrowser
          templateManager={templateManager}
          onTemplateComplete={handleTemplateComplete}
          onCancel={handleTemplateCancel}
        />
      </Box>
    );
  }

  // Otherwise show the commit message input or conventional commit form
  return (
    <Box flexDirection="column">
      {/* Mode toggles */}
      <Box marginBottom={1}>
        <Box marginRight={3}>
          <Text>Use Conventional Commits: </Text>
          <Text color={useConventionalCommit ? 'green' : 'gray'}>
            {useConventionalCommit ? 'Yes' : 'No'}
          </Text>
          <Text dimColor> (Press 'c' to toggle)</Text>
        </Box>
        <Box>
          <Text>Use Templates: </Text>
          <Text color={useTemplates ? 'green' : 'gray'}>{useTemplates ? 'Yes' : 'No'}</Text>
          <Text dimColor> (Press 't' to toggle)</Text>
        </Box>
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
