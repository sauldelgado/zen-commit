import React from 'react';
import { Box, Text, Divider } from './';
import { FileChange } from '../../git/change-detection';

export interface StagedFilesListProps {
  changes: FileChange[];
  title?: string;
  showDetails?: boolean;
}

/**
 * Component for displaying staged files
 */
const StagedFilesList: React.FC<StagedFilesListProps> = ({
  changes,
  title = 'Staged Changes',
  showDetails = false,
}) => {
  // Filter to only show staged changes
  const stagedChanges = changes.filter((change) => change.staged);

  // Count total changes
  const totalInsertions = stagedChanges.reduce(
    (total, change) => total + (change.insertions || 0),
    0,
  );
  const totalDeletions = stagedChanges.reduce(
    (total, change) => total + (change.deletions || 0),
    0,
  );

  // Function to get status indicator
  const getStatusIndicator = (change: FileChange): string => {
    switch (change.type) {
      case 'added':
        return 'A';
      case 'modified':
        return 'M';
      case 'deleted':
        return 'D';
      case 'renamed':
        return 'R';
      case 'copied':
        return 'C';
      default:
        return '?';
    }
  };

  // Function to get change indicator string
  const getChangeIndicator = (change: FileChange): string => {
    const insertions = change.insertions || 0;
    const deletions = change.deletions || 0;

    const parts = [];

    if (insertions > 0) {
      parts.push(`+${insertions}`);
    }

    if (deletions > 0) {
      parts.push(`-${deletions}`);
    }

    return parts.join(' ');
  };

  return (
    <Box flexDirection="column">
      <Divider title={title} />

      {stagedChanges.length === 0 ? (
        <Box marginY={1}>
          <Text dimColor>No staged changes</Text>
        </Box>
      ) : (
        <>
          <Box marginY={1} flexDirection="column">
            {stagedChanges.map((change, index) => (
              <Box key={index} marginBottom={1}>
                <Box width={2} marginRight={1}>
                  <Text
                    color={
                      change.type === 'added'
                        ? 'green'
                        : change.type === 'deleted'
                          ? 'red'
                          : change.type === 'renamed'
                            ? 'blue'
                            : 'yellow'
                    }
                  >
                    {getStatusIndicator(change)}
                  </Text>
                </Box>

                <Box flex={1}>
                  <Text>{change.path}</Text>
                  {change.type === 'renamed' && change.from && (
                    <Text dimColor> (from {change.from})</Text>
                  )}
                </Box>

                <Box marginLeft={1}>
                  <Text
                    color={
                      (change.insertions || 0) > 0
                        ? 'green'
                        : (change.deletions || 0) > 0
                          ? 'red'
                          : 'white'
                    }
                  >
                    {getChangeIndicator(change)}
                  </Text>
                </Box>
              </Box>
            ))}
          </Box>

          {showDetails && (
            <Box marginTop={1} flexDirection="column">
              <Divider title="Details" />
              {stagedChanges.map((change, index) => (
                <Box key={`details-${index}`} marginBottom={1} flexDirection="column">
                  <Text bold>{change.path}</Text>
                  <Box marginLeft={2}>
                    <Text>
                      {change.type.charAt(0).toUpperCase() + change.type.slice(1)},{' '}
                      {change.insertions || 0} insertions, {change.deletions || 0} deletions
                    </Text>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          <Box marginTop={1}>
            <Text bold>
              {stagedChanges.length} file{stagedChanges.length !== 1 ? 's' : ''} •{' '}
              <Text color="green">{totalInsertions > 0 ? `+${totalInsertions}` : ''}</Text>
              {totalInsertions > 0 && totalDeletions > 0 ? ' ' : ''}
              <Text color="red">{totalDeletions > 0 ? `-${totalDeletions}` : ''}</Text>
            </Text>
          </Box>
        </>
      )}
    </Box>
  );
};

export default StagedFilesList;
