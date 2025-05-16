import React from 'react';
import { SuccessFeedback } from '@ui/components';

/**
 * Props for the CommitSuccessScreen component
 */
export interface CommitSuccessScreenProps {
  /** The hash of the successfully created commit */
  commitHash: string;

  /** The message used for the commit */
  commitMessage: string;

  /** The name of the current branch (optional) */
  branchName?: string;

  /** Whether the current branch has remote tracking set up (optional) */
  hasRemote?: boolean;

  /** Function to call when the user dismisses the success screen */
  onDismiss: () => void;
}

/**
 * Screen that shows success feedback after a commit
 *
 * This screen is displayed after a successful commit operation and shows
 * the commit hash, a summary of the commit message, and suggests next steps
 * based on the repository state (whether the branch has remote tracking, etc.).
 *
 * It uses the SuccessFeedback component to display the information and
 * provides context-aware suggestions for next steps.
 *
 * @example
 * ```tsx
 * <CommitSuccessScreen
 *   commitHash="abc1234"
 *   commitMessage="feat: implement new feature"
 *   branchName="feature/new-feature"
 *   hasRemote={false}
 *   onDismiss={() => setScreen('main')}
 * />
 * ```
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
