import React from 'react';
import { Box, Text, Spinner, StagedFilesList } from '../ui/components';
import { useGitChanges } from '../ui/hooks';
import { render } from 'ink';
import { ThemeProvider } from '../ui/ThemeProvider';

const StagedFilesDemo = () => {
  // Get current Git repo path (using process.cwd() for demo)
  const repoPath = process.cwd();

  // Use the Git changes hook
  const { changes, loading, error, refreshChanges } = useGitChanges(repoPath);

  if (error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error loading Git changes:</Text>
        <Text color="red">{error.message}</Text>
      </Box>
    );
  }

  if (loading && changes.length === 0) {
    return (
      <Box padding={1}>
        <Spinner text="Loading Git changes..." />
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Zen Commit - Staged Files Demo</Text>

      <Box marginY={1}>
        <Text>Press 'r' to refresh changes</Text>
      </Box>

      <StagedFilesList changes={changes} />

      <StagedFilesList changes={changes} title="With Details" showDetails />
    </Box>
  );
};

// Render the demo when this file is executed directly
if (require.main === module) {
  render(
    <ThemeProvider>
      <StagedFilesDemo />
    </ThemeProvider>,
  );
}

export default StagedFilesDemo;
