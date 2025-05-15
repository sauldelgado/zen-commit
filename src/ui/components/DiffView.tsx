import React from 'react';
import { Box, Text } from './';
import { FileDiff, DiffHunk } from '../../git/change-detection/types';

export interface DiffViewProps {
  diff: FileDiff;
  showLineNumbers?: boolean;
  maxLines?: number;
}

/**
 * Component for displaying a file diff
 */
const DiffView: React.FC<DiffViewProps> = ({ diff, showLineNumbers = false, maxLines = 0 }) => {
  if (diff.binary) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>{diff.filePath}</Text>
          <Text color="yellow"> (Binary file)</Text>
        </Box>
        <Box marginLeft={2}>
          <Text dimColor>Binary file not shown</Text>
        </Box>
      </Box>
    );
  }

  if (diff.hunks.length === 0) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>{diff.filePath}</Text>
        </Box>
        <Box marginLeft={2}>
          <Text dimColor>No changes</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>{diff.filePath}</Text>
        <Text color="blue">
          {' '}
          ({diff.insertions} insertions, {diff.deletions} deletions)
        </Text>
      </Box>

      {diff.hunks.map((hunk, hunkIndex) => (
        <Box key={hunkIndex} flexDirection="column" marginBottom={1}>
          {/* Hunk header */}
          <Box>
            <Text color="cyan">{hunk.lines[0]}</Text>
          </Box>

          {/* Hunk lines */}
          <Box flexDirection="column" marginLeft={1}>
            {renderHunkLines(hunk, showLineNumbers, maxLines)}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

/**
 * Render hunk lines with optional line numbers and truncation
 * @param hunk Diff hunk
 * @param showLineNumbers Whether to show line numbers
 * @param maxLines Maximum number of lines to show (0 = unlimited)
 * @returns React elements array
 */
function renderHunkLines(
  hunk: DiffHunk,
  showLineNumbers: boolean,
  maxLines: number,
): React.ReactNode {
  // Skip the first line (hunk header)
  const lines = hunk.lines.slice(1);

  // Track line numbers
  let oldLineNum = hunk.oldStart;
  let newLineNum = hunk.newStart;

  // Truncate if necessary
  const displayLines = maxLines > 0 && lines.length > maxLines ? lines.slice(0, maxLines) : lines;

  const remainingLines = maxLines > 0 && lines.length > maxLines ? lines.length - maxLines : 0;

  const lineElements = displayLines.map((line, index) => {
    const prefix = line[0];
    const content = line.slice(1);

    // Determine line numbers
    let oldLine = '';
    let newLine = '';

    if (showLineNumbers) {
      if (prefix === ' ' || prefix === '-') {
        oldLine = oldLineNum.toString();
        oldLineNum++;
      }

      if (prefix === ' ' || prefix === '+') {
        newLine = newLineNum.toString();
        newLineNum++;
      }
    }

    return (
      <Box key={index}>
        {/* Line numbers */}
        {showLineNumbers && (
          <>
            <Box width={4} marginRight={1}>
              <Text dimColor>{oldLine}</Text>
            </Box>
            <Box width={4} marginRight={1}>
              <Text dimColor>{newLine}</Text>
            </Box>
          </>
        )}

        {/* Line prefix */}
        <Box width={1} marginRight={1}>
          <Text color={prefix === '+' ? 'green' : prefix === '-' ? 'red' : 'white'}>{prefix}</Text>
        </Box>

        {/* Line content */}
        <Text color={prefix === '+' ? 'green' : prefix === '-' ? 'red' : 'white'}>{content}</Text>
      </Box>
    );
  });

  // If there are remaining lines, add a truncation message
  if (remainingLines > 0) {
    lineElements.push(
      <Box key="truncated" marginTop={1}>
        <Text dimColor>... {remainingLines} more lines</Text>
      </Box>,
    );
  }

  return lineElements;
}

export default DiffView;
