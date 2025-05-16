import React, { useState, useEffect } from 'react';
import { Box } from '@ui/components';
import { CommitMessageInput, ErrorMessage } from '@ui/components';
import { CommitConfirmationScreen } from '@cli/screens';
import type { StagedFile } from './CommitConfirmationScreen';
import { createGitOperations } from '@git/operations';
import { createErrorHandler } from '@utils/errors';
import type { ErrorResult } from '@utils/errors';

/**
 * Main screen for creating a commit
 */
const CommitScreen: React.FC = () => {
  const [commitMessage, setCommitMessage] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [error, setError] = useState<ErrorResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize git operations and error handler
  const gitOperations = createGitOperations(process.cwd());
  const errorHandler = createErrorHandler();

  // Load staged files when component mounts
  useEffect(() => {
    const loadStagedFiles = async () => {
      try {
        setIsLoading(true);
        const status = await gitOperations.getStatus();

        // Map to the format expected by the component
        const mappedFiles: StagedFile[] = status.staged.map((path) => {
          const file = status.files.find((f) => f.path === path);
          // Convert the GitChangeType to FileStatus
          let fileStatus: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unknown' =
            'modified';

          if (file) {
            switch (file.type) {
              case 'added':
                fileStatus = 'added';
                break;
              case 'deleted':
                fileStatus = 'deleted';
                break;
              case 'renamed':
                fileStatus = 'renamed';
                break;
              case 'copied':
                fileStatus = 'copied';
                break;
              case 'modified':
                fileStatus = 'modified';
                break;
              default:
                fileStatus = 'unknown';
            }
          }

          return {
            path,
            status: fileStatus,
          };
        });

        setStagedFiles(mappedFiles);
      } catch (err) {
        // Handle error loading staged files
        setError(errorHandler.handleError(err as Error));
      } finally {
        setIsLoading(false);
      }
    };

    loadStagedFiles();
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
      await gitOperations.createCommit(commitMessage);

      // Reset state or navigate to success screen
      setCommitMessage('');
      setShowConfirmation(false);

      // Reload staged files to refresh the UI
      const status = await gitOperations.getStatus();
      const mappedFiles: StagedFile[] = status.staged.map((path) => {
        const file = status.files.find((f) => f.path === path);
        // Convert the GitChangeType to FileStatus
        let fileStatus: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unknown' =
          'modified';

        if (file) {
          switch (file.type) {
            case 'added':
              fileStatus = 'added';
              break;
            case 'deleted':
              fileStatus = 'deleted';
              break;
            case 'renamed':
              fileStatus = 'renamed';
              break;
            case 'copied':
              fileStatus = 'copied';
              break;
            case 'modified':
              fileStatus = 'modified';
              break;
            default:
              fileStatus = 'unknown';
          }
        }

        return {
          path,
          status: fileStatus,
        };
      });
      setStagedFiles(mappedFiles);

      // In a real implementation, we would transition to a success screen
      // For now, we'll just clear the error state
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
          const mappedFiles: StagedFile[] = status.staged.map((path) => {
            const file = status.files.find((f) => f.path === path);
            // Convert the GitChangeType to FileStatus
            let fileStatus: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unknown' =
              'modified';

            if (file) {
              switch (file.type) {
                case 'added':
                  fileStatus = 'added';
                  break;
                case 'deleted':
                  fileStatus = 'deleted';
                  break;
                case 'renamed':
                  fileStatus = 'renamed';
                  break;
                case 'copied':
                  fileStatus = 'copied';
                  break;
                case 'modified':
                  fileStatus = 'modified';
                  break;
                default:
                  fileStatus = 'unknown';
              }
            }

            return {
              path,
              status: fileStatus,
            };
          });
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
