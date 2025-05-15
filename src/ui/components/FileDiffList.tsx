import React, { useState, useEffect } from 'react';
import { Box, Text, Spinner } from './';
import { FileChange, FileDiff, getFileDiff } from '../../git/change-detection';
import DiffView from './DiffView';

export interface FileDiffListProps {
  changes: FileChange[];
  repoPath: string;
  maxDiffsToShow?: number;
  loading?: boolean;
}

/**
 * Component for displaying a list of file diffs
 */
const FileDiffList: React.FC<FileDiffListProps> = ({
  changes,
  repoPath,
  maxDiffsToShow = 3,
  loading = false,
}) => {
  const [diffs, setDiffs] = useState<Record<string, FileDiff | null>>({});
  const [loadingDiffs, setLoadingDiffs] = useState(false);
  const [expandedFile, setExpandedFile] = useState<string | null>(null);

  // Limit to staged changes
  const stagedChanges = changes.filter((change) => change.staged);

  // Load diffs for staged changes
  useEffect(() => {
    const loadDiffs = async () => {
      if (loading || stagedChanges.length === 0) {
        return;
      }

      setLoadingDiffs(true);

      const newDiffs: Record<string, FileDiff | null> = { ...diffs };

      // Load diffs for each file (limited to improve performance)
      const filesToLoad = expandedFile
        ? [expandedFile]
        : stagedChanges.slice(0, maxDiffsToShow).map((change) => change.path);

      for (const filePath of filesToLoad) {
        if (!newDiffs[filePath]) {
          newDiffs[filePath] = await getFileDiff(repoPath, filePath, true);
        }
      }

      setDiffs(newDiffs);
      setLoadingDiffs(false);
    };

    loadDiffs();
  }, [changes, repoPath, expandedFile, maxDiffsToShow, loading, diffs]);

  if (loading) {
    return (
      <Box marginY={1}>
        <Spinner text="Loading diffs..." />
      </Box>
    );
  }

  if (stagedChanges.length === 0) {
    return (
      <Box marginY={1}>
        <Text dimColor>No files to display</Text>
      </Box>
    );
  }

  // If a file is expanded, show only that file's diff
  if (expandedFile) {
    const diff = diffs[expandedFile];

    return (
      <Box flexDirection="column">
        {loadingDiffs ? (
          <Box marginY={1}>
            <Spinner text={`Loading diff for ${expandedFile}...`} />
          </Box>
        ) : diff ? (
          <>
            <DiffView diff={diff} showLineNumbers maxLines={100} />
            <Box marginTop={1}>
              <Text
                color="blue"
                underline
                // In a real component, this would use proper interactivity
                onClick={() => setExpandedFile(null)}
              >
                Back to file list
              </Text>
            </Box>
          </>
        ) : (
          <Box marginY={1}>
            <Text color="red">Failed to load diff for {expandedFile}</Text>
          </Box>
        )}
      </Box>
    );
  }

  // Show list of files with diffs
  return (
    <Box flexDirection="column">
      {loadingDiffs && (
        <Box marginY={1}>
          <Spinner text="Loading diffs..." />
        </Box>
      )}

      {stagedChanges.slice(0, maxDiffsToShow).map((change) => {
        const diff = diffs[change.path];

        return (
          <Box key={change.path} flexDirection="column" marginBottom={2}>
            {diff ? (
              <>
                <DiffView diff={diff} maxLines={10} />
                <Box marginTop={1}>
                  <Text
                    color="blue"
                    underline
                    // In a real component, this would use proper interactivity
                    onClick={() => setExpandedFile(change.path)}
                  >
                    View full diff
                  </Text>
                </Box>
              </>
            ) : (
              <Box flexDirection="column">
                <Box marginBottom={1}>
                  <Text bold>{change.path}</Text>
                </Box>
                <Box marginLeft={2}>
                  <Text dimColor>{change.binary ? 'Binary file' : 'Loading diff...'}</Text>
                </Box>
              </Box>
            )}
          </Box>
        );
      })}

      {stagedChanges.length > maxDiffsToShow && (
        <Box marginTop={1}>
          <Text dimColor>{stagedChanges.length - maxDiffsToShow} more files not shown</Text>
        </Box>
      )}
    </Box>
  );
};

export default FileDiffList;
