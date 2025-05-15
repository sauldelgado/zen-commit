import React from 'react';
import { Box, Text, Spinner, FileDiffList } from '../ui/components';
import { useGitChanges } from '../ui/hooks';
import App from '../ui/App';

const DiffViewDemo = () => {
  // Get current Git repo path (using process.cwd() for demo)
  const repoPath = process.cwd();

  // Use the Git changes hook
  const { changes, loading, error } = useGitChanges(repoPath);

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
      <Text bold>Zen Commit - Diff Visualization Demo</Text>

      <Box marginY={1}>
        <Text>Press 'r' to refresh changes</Text>
      </Box>

      <FileDiffList changes={changes} repoPath={repoPath} loading={loading} />
    </Box>
  );
};

// Render the demo when this file is executed directly
if (require.main === module) {
  // Use ink's render directly to ensure output to terminal
  const { render } = require('ink');

  render(
    <App>
      <DiffViewDemo />
    </App>,
  );
}

export default DiffViewDemo;
