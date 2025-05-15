import React from 'react';
import { Box, Text } from './';

export interface CharacterCounterProps {
  current: number;
  limit?: number;
  label?: string;
  showWarning?: boolean;
}

/**
 * Component for displaying character count with visual feedback
 */
const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  limit,
  label,
  showWarning = true,
}) => {
  // Determine if count is approaching/exceeding limit
  const isNearLimit = limit ? current > limit * 0.8 : false;
  const isOverLimit = limit ? current > limit : false;

  // Determine color based on count
  const color = isOverLimit ? 'red' : isNearLimit ? 'yellow' : 'green';

  return (
    <Box>
      {label && (
        <Box marginRight={1}>
          <Text>{label}:</Text>
        </Box>
      )}

      <Text color={color}>
        {current}
        {limit ? `/${limit}` : ''}
      </Text>

      {showWarning && isOverLimit && (
        <Box marginLeft={1}>
          <Text color="red">Too long</Text>
        </Box>
      )}
    </Box>
  );
};

export default CharacterCounter;
