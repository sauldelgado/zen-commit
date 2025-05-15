import simpleGit from 'simple-git';
import { createGitOperations } from '../operations';
import { parseGitDiff } from './diff-parser';
import { getFileType, categorizeChanges, getChangeStats } from './utils';
import { FileChange, ChangeType, ChangeCategories, ChangeStats, FileDiff } from './types';

/**
 * Get detailed file changes from a Git repository
 * @param repoPath Path to the Git repository
 * @returns List of file changes
 */
export async function getFileChanges(repoPath: string): Promise<FileChange[]> {
  const git = createGitOperations(repoPath);
  const status = await git.getStatus();

  // Get detailed changes using diff
  const changes: FileChange[] = [];

  // Process staged files
  if (status.staged.length > 0) {
    await addDiffInfo(changes, repoPath, true);
  }

  // Process unstaged files
  if (status.modified.length > 0 || status.deleted.length > 0) {
    await addDiffInfo(changes, repoPath, false);
  }

  // Add untracked files (which won't be in the diff)
  for (const file of status.untracked) {
    changes.push({
      path: file,
      type: 'untracked',
      staged: false,
      fileType: getFileType(file),
      insertions: 0,
      deletions: 0,
    });
  }

  // Mark newly created files as 'added'
  for (const file of status.staged) {
    // Skip files we already processed
    if (changes.some((change) => change.path === file && change.staged)) {
      continue;
    }

    changes.push({
      path: file,
      type: 'added',
      staged: true,
      fileType: getFileType(file),
      insertions: 1, // Default for newly added files
      deletions: 0,
    });
  }

  return changes;
}

/**
 * Add diff information to changes list
 * @param changes List to add changes to
 * @param repoPath Path to the Git repository
 * @param staged Whether to get staged or unstaged changes
 */
async function addDiffInfo(
  changes: FileChange[],
  repoPath: string,
  staged: boolean,
): Promise<void> {
  const git = simpleGit(repoPath);

  // Get diff with line info
  const diffOptions = ['--numstat'];

  if (staged) {
    diffOptions.push('--staged');
  }

  // Get detailed diff with content
  const diffOutput = await git.diff(diffOptions);

  // For file content, get regular diff - can be used for detailed hunks if needed
  // const contentDiff = await git.diff([
  //   ...(staged ? ['--staged'] : []),
  //   '--patch'
  // ]);

  // Parse the content diff - can be used for detailed hunks if needed
  // const fileDiffs = parseGitDiff(contentDiff);

  // Parse numstat output (format: insertions deletions path)
  const lines = diffOutput.trim().split('\n');

  for (const line of lines) {
    if (!line.trim()) continue;

    const [insertionsStr, deletionsStr, filePath] = line.split('\t');

    // Skip binary files (marked with - -)
    if (insertionsStr === '-' && deletionsStr === '-') {
      changes.push({
        path: filePath,
        type: determineChangeType(filePath, staged),
        staged,
        binary: true,
        fileType: getFileType(filePath),
      });
      continue;
    }

    const insertions = parseInt(insertionsStr, 10) || 0;
    const deletions = parseInt(deletionsStr, 10) || 0;

    // Find matching content diff - can be used for detailed hunks if needed
    // const contentDiffInfo = fileDiffs.find(diff => diff.filePath === filePath);

    changes.push({
      path: filePath,
      type: determineChangeType(filePath, staged),
      staged,
      insertions,
      deletions,
      fileType: getFileType(filePath),
    });
  }
}

/**
 * Determine the type of change for a file
 * @param filePath File path
 * @param staged Whether the file is staged
 * @returns Type of change
 */
function determineChangeType(filePath: string, _staged: boolean): ChangeType {
  // This is a simplified implementation
  // A real implementation would use the GitStatus and other context

  // For renamed files, Git shows paths with " => " in them
  if (filePath && filePath.includes(' => ')) {
    return 'renamed';
  }

  // In a real implementation, we would check:
  // - If the file is newly created and staged: added
  // - If the file is deleted from the working directory: deleted
  // - If the file is modified in the working directory: modified
  // - If the file is untracked: untracked

  // For simplicity in the mock version, we just return modified
  // For real implementation, this would use the Git status
  return 'modified';
}

/**
 * Get detailed diff for a file
 * @param repoPath Path to the Git repository
 * @param filePath Path to the file
 * @param staged Whether to get diff for staged changes
 * @returns Parsed diff information
 */
export async function getFileDiff(
  repoPath: string,
  filePath: string,
  staged = false,
): Promise<FileDiff | null> {
  const git = simpleGit(repoPath);

  try {
    // Handle binary files
    const isBinary = await checkIsBinary(repoPath, filePath);

    if (isBinary) {
      return {
        filePath,
        insertions: 0,
        deletions: 0,
        binary: true,
        hunks: [],
      };
    }

    // Get diff
    const diffOptions = ['--patch'];

    if (staged) {
      diffOptions.push('--staged');
    }

    // For a specific file
    diffOptions.push('--', filePath);

    const diffOutput = await git.diff(diffOptions);

    if (!diffOutput.trim()) {
      // No changes
      return {
        filePath,
        insertions: 0,
        deletions: 0,
        binary: false,
        hunks: [],
      };
    }

    // Parse the diff
    const fileDiffs = parseGitDiff(diffOutput);

    // Return the first (and should be only) file diff
    return fileDiffs[0] || null;
  } catch (error) {
    console.error(`Error getting diff for ${filePath}:`, error);
    return null;
  }
}

/**
 * Check if a file is binary
 * @param repoPath Path to the Git repository
 * @param filePath Path to the file
 * @returns Whether the file is binary
 */
async function checkIsBinary(repoPath: string, filePath: string): Promise<boolean> {
  try {
    const git = simpleGit(repoPath);

    // Use git-check-attr to determine if a file is binary
    const result = await git.raw(['check-attr', 'binary', '--', filePath]);

    return result.includes('binary: set');
  } catch (error) {
    // If unable to determine, assume it's not binary
    return false;
  }
}

// Export the utility functions
export { categorizeChanges, getChangeStats, getFileType, parseGitDiff };

// Export types
export type { FileChange, ChangeType, ChangeCategories, ChangeStats, FileDiff };
