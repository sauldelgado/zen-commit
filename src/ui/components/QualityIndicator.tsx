import React from 'react';
import { Box, Text } from './';

export interface QualityIndicatorProps {
  score: number;
  label?: string;
  width?: number;
}

/**
 * Component for displaying a quality score visually
 */
const QualityIndicator: React.FC<QualityIndicatorProps> = ({ score, label, width = 10 }) => {
  // Ensure score is between 0 and 1
  const normalizedScore = Math.max(0, Math.min(1, score));

  // Calculate filled and empty segments
  const filledCount = Math.round(normalizedScore * width);
  const emptyCount = width - filledCount;

  // Create progress bar
  const filledChar = '█';
  const emptyChar = '░';

  const progressBar = filledChar.repeat(filledCount) + emptyChar.repeat(emptyCount);

  // Determine color based on score
  const color = normalizedScore < 0.4 ? 'red' : normalizedScore < 0.7 ? 'yellow' : 'green';

  return (
    <Box>
      {label && (
        <Box marginRight={1}>
          <Text>{label}:</Text>
        </Box>
      )}

      <Text color={color}>{progressBar}</Text>

      <Box marginLeft={1}>
        <Text>{Math.round(normalizedScore * 100)}%</Text>
      </Box>
    </Box>
  );
};

export default QualityIndicator;
