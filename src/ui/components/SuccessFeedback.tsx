import React from 'react';
import { Box, Text } from './';
import SelectInput from 'ink-select-input';

export interface SuccessFeedbackProps {
  title: string;
  message: string;
  commitHash: string;
  onDismiss: () => void;
  nextSteps?: string[];
}

/**
 * Component for displaying success feedback after a commit
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
