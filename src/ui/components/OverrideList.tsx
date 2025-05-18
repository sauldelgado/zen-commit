import React, { useState } from 'react';
import { Box, Text } from './';
import { useInput } from 'ink';
import { OverrideRecord } from '../../core/override-manager';

export interface OverrideListProps {
  overrides: OverrideRecord[];
  onRemoveOverride: (patternId: string) => void;
}

/**
 * Component for displaying and managing override list
 */
const OverrideList: React.FC<OverrideListProps> = ({ overrides, onRemoveOverride }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Ensure selected index is within bounds
  const effectiveSelectedIndex = Math.min(selectedIndex, overrides.length - 1);

  // Handle keyboard input
  useInput((input, key) => {
    if (key.upArrow) {
      // Navigate up
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.downArrow) {
      // Navigate down
      setSelectedIndex((prev) => Math.min(overrides.length - 1, prev + 1));
    } else if (input === 'r' && overrides.length > 0) {
      // Remove selected override
      onRemoveOverride(overrides[effectiveSelectedIndex].patternId);
    }
  });

  // Format date from ISO string
  const formatDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <Box flexDirection="column" borderStyle="round" borderColor="blue" padding={1}>
      <Box marginBottom={1}>
        <Text bold>Active Overrides</Text>
      </Box>

      {overrides.length === 0 ? (
        <Box>
          <Text>No active overrides</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          {overrides.map((override, index) => (
            <Box
              key={override.patternId}
              flexDirection="column"
              marginBottom={1}
              borderStyle={index === effectiveSelectedIndex ? 'single' : undefined}
              borderColor="blue"
              padding={index === effectiveSelectedIndex ? 1 : 0}
            >
              <Box>
                <Text bold>
                  {index === effectiveSelectedIndex ? '> ' : '  '}
                  {override.patternId}
                </Text>
                {override.category && <Text dimColor> ({override.category})</Text>}
              </Box>

              <Box marginLeft={2}>
                <Text>Reason: {override.reason}</Text>
              </Box>

              <Box marginLeft={2}>
                <Text dimColor>Created: {formatDate(override.createdAt)}</Text>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>↑/↓: Navigate | R: Remove override | Esc: Close</Text>
      </Box>
    </Box>
  );
};

export default OverrideList;
