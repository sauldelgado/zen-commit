import React from 'react';
import { Box, Text } from './';
import SelectInput from 'ink-select-input';

/**
 * Props for the SuccessFeedback component
 */
export interface SuccessFeedbackProps {
  /** Title displayed at the top of the success message */
  title: string;

  /** Main success message shown to the user */
  message: string;

  /** Commit hash to display */
  commitHash: string;

  /** Function called when the user dismisses the success message */
  onDismiss: () => void;

  /** Optional list of suggested next steps to show to the user */
  nextSteps?: string[];
}

/**
 * Component for displaying success feedback after a commit
 *
 * This component shows a success message with the commit hash and optional
 * next steps for the user after a successful commit operation. It includes
 * a dismiss button to close the feedback message.
 *
 * @example
 * ```tsx
 * <SuccessFeedback
 *   title="Commit Successful"
 *   message="Your changes have been committed"
 *   commitHash="abc1234"
 *   nextSteps={[
 *     'Push your changes with "git push"',
 *     'Create a new branch with "git checkout -b new-branch"'
 *   ]}
 *   onDismiss={() => console.log('Dismissed')}
 * />
 * ```
 */
const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  title,
  message,
  commitHash,
  onDismiss,
  nextSteps = [],
}) => {
  // Create a list of actions
  const actions = [{ label: 'OK', value: 'dismiss' }];

  const handleSelect = () => {
    onDismiss();
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="green" padding={1} width={80}>
      <Box marginBottom={1}>
        <Text bold color="green">
          {title}
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text>{message}</Text>
      </Box>

      <Box marginBottom={1}>
        <Text>Commit hash: </Text>
        <Text bold>{commitHash}</Text>
      </Box>

      {nextSteps.length > 0 && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>Next Steps:</Text>
          {nextSteps.map((step, index) => (
            <Text key={index}> • {step}</Text>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <SelectInput items={actions} onSelect={handleSelect} />
      </Box>
    </Box>
  );
};

export default SuccessFeedback;
