import { mapGitStatusToStagedFiles } from '@git/utils';
import { GitChangeType, GitStatus } from '@git/types';

describe('Git Utilities', () => {
  describe('mapGitStatusToStagedFiles', () => {
    it('should correctly map Git status to staged files', () => {
      // Create a mock GitStatus
      const mockStatus: GitStatus = {
        isClean: false,
        current: 'main',
        files: [
          { path: 'file1.txt', type: GitChangeType.ADDED, staged: true },
          { path: 'file2.txt', type: GitChangeType.MODIFIED, staged: true },
          { path: 'file3.txt', type: GitChangeType.DELETED, staged: true },
          {
            path: 'file4.txt',
            type: GitChangeType.RENAMED,
            staged: true,
            originalPath: 'old-file4.txt',
          },
          { path: 'file5.txt', type: GitChangeType.UNTRACKED, staged: false },
        ],
        staged: ['file1.txt', 'file2.txt', 'file3.txt', 'file4.txt'],
        modified: ['file2.txt'],
        deleted: ['file3.txt'],
        untracked: ['file5.txt'],
        ahead: 0,
        behind: 0,
      };

      // Call the function
      const stagedFiles = mapGitStatusToStagedFiles(mockStatus);

      // Assertions
      expect(stagedFiles).toHaveLength(4);

      expect(stagedFiles[0].path).toBe('file1.txt');
      expect(stagedFiles[0].status).toBe('added');

      expect(stagedFiles[1].path).toBe('file2.txt');
      expect(stagedFiles[1].status).toBe('modified');

      expect(stagedFiles[2].path).toBe('file3.txt');
      expect(stagedFiles[2].status).toBe('deleted');

      expect(stagedFiles[3].path).toBe('file4.txt');
      expect(stagedFiles[3].status).toBe('renamed');
    });

    it('should default to modified for unknown change types', () => {
      const mockStatus: GitStatus = {
        isClean: false,
        current: 'main',
        files: [
          { path: 'file1.txt', type: GitChangeType.UNMODIFIED, staged: true }, // Edge case
        ],
        staged: ['file1.txt'],
        modified: [],
        deleted: [],
        untracked: [],
        ahead: 0,
        behind: 0,
      };

      const stagedFiles = mapGitStatusToStagedFiles(mockStatus);

      expect(stagedFiles).toHaveLength(1);
      expect(stagedFiles[0].path).toBe('file1.txt');
      expect(stagedFiles[0].status).toBe('unknown');
    });

    it('should handle case when file details are not found', () => {
      const mockStatus: GitStatus = {
        isClean: false,
        current: 'main',
        files: [],
        staged: ['file1.txt'], // File in staged but not in files array
        modified: [],
        deleted: [],
        untracked: [],
        ahead: 0,
        behind: 0,
      };

      const stagedFiles = mapGitStatusToStagedFiles(mockStatus);

      expect(stagedFiles).toHaveLength(1);
      expect(stagedFiles[0].path).toBe('file1.txt');
      expect(stagedFiles[0].status).toBe('modified'); // Defaults to modified
    });
  });
});
