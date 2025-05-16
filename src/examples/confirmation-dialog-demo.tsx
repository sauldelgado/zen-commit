import React, { useState } from 'react';
import { render } from 'ink';
import { Box, Text } from '@ui/components';
import { CommitConfirmationScreen } from '@cli/screens';

const Demo = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const stagedFiles = [
    { path: 'src/index.ts', status: 'modified' as const },
    { path: 'src/components/Button.tsx', status: 'added' as const },
    { path: 'README.md', status: 'modified' as const },
    { path: 'LICENSE', status: 'deleted' as const },
    { path: 'src/new-file.ts', status: 'renamed' as const },
  ];

  const handleConfirm = () => {
    setConfirmed(true);
    setCancelled(false);
  };

  const handleCancel = () => {
    setConfirmed(false);
    setCancelled(true);
  };

  if (confirmed) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="green">✅ Commit confirmed!</Text>
        <Text>Your changes have been committed.</Text>
      </Box>
    );
  }

  if (cancelled) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">⚠️ Commit cancelled!</Text>
        <Text>Your changes were not committed.</Text>
      </Box>
    );
  }

  return (
    <CommitConfirmationScreen
      commitMessage="feat: implement confirmation dialog for commits"
      stagedFiles={stagedFiles}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

render(<Demo />);
