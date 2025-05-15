import React from 'react';
import { Box, Text } from './';

export interface DividerProps {
  title?: string;
  width?: number;
  character?: string;
}

/**
 * A divider component for separating content
 */
const Divider: React.FC<DividerProps> = ({ title, width = 50, character = '─' }) => {
  if (title) {
    // Calculate space for dividers on both sides
    const sideWidth = Math.max(2, Math.floor((width - title.length - 2) / 2));
    const leftSide = character.repeat(sideWidth);
    const rightSide = character.repeat(width - sideWidth - title.length - 2);

    return (
      <Box marginY={1}>
        <Text>
          {leftSide} {title} {rightSide}
        </Text>
      </Box>
    );
  }

  return (
    <Box marginY={1}>
      <Text>{character.repeat(width)}</Text>
    </Box>
  );
};

export default Divider;
