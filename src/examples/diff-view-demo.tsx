import React from 'react';
import { Box, Text, Spinner, FileDiffList } from '../ui/components';
import { useGitChanges } from '../ui/hooks';
import { App } from '../ui/App';

// Import required modules to support rendering
import { render } from 'ink';

const DiffViewDemo = () => {
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
      <Text bold>Zen Commit - Diff Visualization Demo</Text>

      <Box marginY={1}>
        <Text>Press 'r' to refresh changes</Text>
      </Box>

      <FileDiffList changes={changes} repoPath={repoPath} loading={loading} />
    </Box>
  );
};

// Function to render the app
function renderApp() {
  const { unmount } = render(
    <App>
      <DiffViewDemo />
    </App>,
  );

  // Return the unmount function for cleanup
  return unmount;
}

// Render the demo when this file is executed directly
if (require.main === module) {
  renderApp();
}

export default DiffViewDemo;
