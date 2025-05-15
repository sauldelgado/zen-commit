import { FileDiff, DiffHunk } from './types';

/**
 * Parse Git diff output into structured data
 * @param diffOutput Raw Git diff output
 * @returns Parsed diff information
 */
export function parseGitDiff(diffOutput: string): FileDiff[] {
  const files: FileDiff[] = [];
  let currentFile: FileDiff | null = null;
  let currentHunk: DiffHunk | null = null;

  // Split diff output into lines
  const lines = diffOutput.split('\n');

  for (const line of lines) {
    // New file diff
    if (line.startsWith('diff --git ')) {
      // Save previous file if exists
      if (currentFile) {
        files.push(currentFile);
      }

      // Extract file paths
      const match = line.match(/diff --git a\/(.*) b\/(.*)/);
      if (match) {
        const [, oldPath, newPath] = match;
        currentFile = {
          filePath: newPath,
          oldPath: oldPath !== newPath ? oldPath : undefined,
          insertions: 0,
          deletions: 0,
          binary: false,
          hunks: [],
        };
      }

      currentHunk = null;
      continue;
    }

    // Check for binary file
    if (line.includes('Binary files') && currentFile) {
      currentFile.binary = true;
      continue;
    }

    // Hunk header, e.g. @@ -1,3 +1,4 @@
    if (line.startsWith('@@') && currentFile) {
      // Save previous hunk if exists
      if (currentHunk) {
        currentFile.hunks.push(currentHunk);
      }

      // Parse hunk header
      const match = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);
      if (match) {
        const [, oldStart, oldLines = '1', newStart, newLines = '1'] = match;

        currentHunk = {
          oldStart: parseInt(oldStart, 10),
          oldLines: parseInt(oldLines, 10),
          newStart: parseInt(newStart, 10),
          newLines: parseInt(newLines, 10),
          lines: [line],
        };
      }

      continue;
    }

    // Add line to current hunk
    if (currentHunk && currentFile) {
      currentHunk.lines.push(line);

      // Count insertions and deletions
      if (line.startsWith('+') && !line.startsWith('+++')) {
        currentFile.insertions++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        currentFile.deletions++;
      }
    }
  }

  // Add the last file and hunk
  if (currentFile) {
    if (currentHunk) {
      currentFile.hunks.push(currentHunk);
    }
    files.push(currentFile);
  }

  return files;
}
