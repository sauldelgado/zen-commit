import {
  GitOperations,
  createGitOperations,
  GitError,
  GitErrorType,
} from '../../../src/git/operations';
import simpleGit from 'simple-git';

// Mock simple-git
jest.mock('simple-git');

describe('Git Operations Interface', () => {
  let gitOps: GitOperations;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock implementation for simpleGit
    (simpleGit as jest.Mock).mockImplementation(() => ({
      status: jest.fn().mockResolvedValue({
        modified: ['file1.txt'],
        staged: ['file2.txt'],
        not_added: ['file3.txt'], // untracked files
        deleted: ['file4.txt'],
        current: 'main',
        tracking: 'origin/main',
        ahead: 1,
        behind: 0,
        isClean: jest.fn().mockReturnValue(false),
      }),
      add: jest.fn().mockResolvedValue(undefined),
      commit: jest.fn().mockResolvedValue({
        commit: '1234abcd',
        branch: 'main',
        summary: { changes: 1 },
      }),
      reset: jest.fn().mockResolvedValue(undefined),
      raw: jest.fn().mockImplementation((args) => {
        if (args.includes('config')) {
          return Promise.resolve('user.name=Test User');
        }
        return Promise.resolve('');
      }),
      revparse: jest.fn().mockResolvedValue('main'),
      branch: jest.fn().mockResolvedValue({
        all: ['main', 'develop', 'feature/test'],
      }),
      checkout: jest.fn().mockResolvedValue(undefined),
    }));

    gitOps = createGitOperations('/test/repo');
  });

  describe('getStatus', () => {
    it('should return repository status', async () => {
      const status = await gitOps.getStatus();

      expect(status).toBeDefined();
      expect(status.modified).toContain('file1.txt');
      expect(status.staged).toContain('file2.txt');
      expect(status.isClean).toBe(false);
    });

    it('should handle errors', async () => {
      // Create new instance with mocked error implementation
      jest.clearAllMocks();
      (simpleGit as jest.Mock).mockImplementation(() => ({
        status: jest.fn().mockRejectedValue(new Error('Git error')),
      }));

      const errorGitOps = createGitOperations('/test/repo');
      await expect(errorGitOps.getStatus()).rejects.toThrow(GitError);
    });
  });

  describe('stageFiles', () => {
    it('should stage specified files', async () => {
      await gitOps.stageFiles(['file1.txt', 'file2.txt']);

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      expect(gitInstance.add).toHaveBeenCalledWith(['file1.txt', 'file2.txt']);
    });

    it('should handle empty file list', async () => {
      await gitOps.stageFiles([]);

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      expect(gitInstance.add).not.toHaveBeenCalled();
    });
  });

  describe('unstageFiles', () => {
    it('should unstage specified files', async () => {
      await gitOps.unstageFiles(['file1.txt', 'file2.txt']);

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      // reset command is used to unstage files
      expect(gitInstance.reset).toHaveBeenCalledWith(['HEAD', '--', 'file1.txt', 'file2.txt']);
    });
  });

  describe('createCommit', () => {
    it('should create a commit with the specified message', async () => {
      const result = await gitOps.createCommit('Test commit message');

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      expect(gitInstance.commit).toHaveBeenCalledWith('Test commit message', []);
      expect(result.commitHash).toBe('1234abcd');
      expect(result.branch).toBe('main');
    });

    it('should handle empty message error', async () => {
      await expect(gitOps.createCommit('')).rejects.toThrow(
        new GitError('Commit message cannot be empty', GitErrorType.VALIDATION_ERROR),
      );
    });

    it('should pass commit options correctly', async () => {
      await gitOps.createCommit('Test commit message', {
        noVerify: true,
        signOff: true,
        allowEmpty: true,
      });

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      expect(gitInstance.commit).toHaveBeenCalledWith('Test commit message', [
        '--no-verify',
        '--signoff',
        '--allow-empty',
      ]);
    });
  });

  describe('getCurrentBranch', () => {
    it('should get the current branch name', async () => {
      const branch = await gitOps.getCurrentBranch();

      expect(branch).toBe('main');
    });
  });

  describe('getConfig', () => {
    it('should get a git config value', async () => {
      const value = await gitOps.getConfig('user.name');

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      expect(gitInstance.raw).toHaveBeenCalledWith(['config', '--get', 'user.name']);
      expect(value).toBe('user.name=Test User');
    });
  });

  describe('getBranches', () => {
    it('should get all available branches', async () => {
      const branches = await gitOps.getBranches();

      expect(branches).toEqual(['main', 'develop', 'feature/test']);
    });
  });

  describe('checkoutBranch', () => {
    it('should checkout the specified branch', async () => {
      await gitOps.checkoutBranch('develop');

      // Get the mock instance
      const gitInstance = (simpleGit as jest.Mock).mock.results[0].value;

      expect(gitInstance.checkout).toHaveBeenCalledWith('develop');
    });
  });

  describe('retry mechanism', () => {
    it('should retry operations on specific errors', async () => {
      let attempts = 0;

      // Mock implementation that fails on first attempt but succeeds on second
      jest.clearAllMocks();
      (simpleGit as jest.Mock).mockImplementation(() => ({
        status: jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts === 1) {
            return Promise.reject(new Error('index.lock: File exists'));
          }
          return Promise.resolve({
            modified: ['file1.txt'],
            staged: ['file2.txt'],
            not_added: ['file3.txt'],
            deleted: [],
            current: 'main',
            tracking: 'origin/main',
            ahead: 0,
            behind: 0,
            isClean: jest.fn().mockReturnValue(false),
          });
        }),
      }));

      // Create new instance to use the new mock
      const retryGitOps = createGitOperations('/test/repo');
      const status = await retryGitOps.getStatus();

      expect(attempts).toBe(2);
      expect(status).toBeDefined();
      expect(status.modified).toContain('file1.txt');
    });
  });
});
