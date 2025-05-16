import { GitStatus, GitChangeType } from './types';
import type { StagedFile } from '../cli/screens/CommitConfirmationScreen';

/**
 * Maps git status to staged files array for UI components
 *
 * @param status Git repository status
 * @returns Array of staged files in the format expected by UI components
 */
export function mapGitStatusToStagedFiles(status: GitStatus): StagedFile[] {
  return status.staged.map((path) => {
    const file = status.files.find((f) => f.path === path);
    // Convert the GitChangeType to FileStatus
    let fileStatus: 'modified' | 'added' | 'deleted' | 'renamed' | 'copied' | 'unknown' =
      'modified';

    if (file) {
      switch (file.type) {
        case GitChangeType.ADDED:
          fileStatus = 'added';
          break;
        case GitChangeType.DELETED:
          fileStatus = 'deleted';
          break;
        case GitChangeType.RENAMED:
          fileStatus = 'renamed';
          break;
        case GitChangeType.COPIED:
          fileStatus = 'copied';
          break;
        case GitChangeType.MODIFIED:
          fileStatus = 'modified';
          break;
        default:
          fileStatus = 'unknown';
      }
    }

    return {
      path,
      status: fileStatus,
    };
  });
}
