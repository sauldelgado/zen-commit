import React from 'react';
import { SuccessFeedback } from '@ui/components';

export interface CommitSuccessScreenProps {
  commitHash: string;
  commitMessage: string;
  branchName?: string;
  hasRemote?: boolean;
  onDismiss: () => void;
}

/**
 * Screen that shows success feedback after a commit
 */
const CommitSuccessScreen: React.FC<CommitSuccessScreenProps> = ({
  commitHash,
  commitMessage,
  branchName,
  hasRemote = false,
  onDismiss,
}) => {
  // Generate next steps based on context
  const getNextSteps = (): string[] => {
    const steps = [];

    if (hasRemote) {
      steps.push(`Push your changes with "git push"`);
    } else if (branchName) {
      steps.push(`Set up remote tracking with "git push -u origin ${branchName}"`);
    }

    steps.push('Create a new branch with "git checkout -b new-branch"');
    steps.push('View your commit with "git show"');

    return steps;
  };

  // Format the commit message for display (truncate if too long)
  const formatCommitMessage = (message: string): string => {
    if (message.length > 50) {
      return `${message.substring(0, 47)}...`;
    }
    return message;
  };

  return (
    <SuccessFeedback
      title="Commit Successful"
      message={`Your changes have been committed with message: "${formatCommitMessage(commitMessage)}"`}
      commitHash={commitHash}
      nextSteps={getNextSteps()}
      onDismiss={onDismiss}
    />
  );
};

export default CommitSuccessScreen;
