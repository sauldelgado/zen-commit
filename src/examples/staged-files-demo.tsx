import React from 'react';
import { Box, Text, Spinner, StagedFilesList } from '../ui/components';
import { useGitChanges } from '../ui/hooks';
import { App, renderApp } from '../ui';

const StagedFilesDemo = () => {
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
      <Text bold>Zen Commit - Staged Files Demo</Text>

      <Box marginY={1}>
        <Text>Press 'r' to refresh changes</Text>
      </Box>

      <StagedFilesList changes={changes} />

      <StagedFilesList changes={changes} title="With Details" showDetails />
    </Box>
  );
};

// Demo script for staged files listing

// Render the demo when this file is executed directly
if (require.main === module) {
  console.log('Starting staged files demo...');
  
  // Check if we're in a real terminal
  if (process.env.NODE_ENV !== 'production') {
    console.log('NOTE: This is a development build. Some features may not work as expected.');
    console.log('The renderApp function is currently a mock for testing purposes.');
    console.log('In a real production build, you would see a fully interactive UI here.');
    console.log('For now, here is some debug information about your git repository:');
    
    // Print some debug info
    const { execSync } = require('child_process');
    try {
      const stagedFiles = execSync('git diff --name-only --staged').toString().trim();
      console.log('\nStaged files:');
      if (stagedFiles) {
        console.log(stagedFiles);
      } else {
        console.log('No files staged for commit');
      }
    } catch (err: any) {
      console.log('Error getting git status:', err.message);
    }
    
    // Finally render the app (which will use the mock renderer)
    console.log('\nAttempting to render UI (mock version)...');
  }
  
  renderApp(
    <App>
      <StagedFilesDemo />
    </App>
  );
}

export default StagedFilesDemo;
