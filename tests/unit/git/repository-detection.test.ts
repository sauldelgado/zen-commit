import {
  isGitRepository,
  getRepositoryRoot,
  getRepositoryStatus,
  isSubmodule,
  findTopLevelRepository,
  validateRepository,
} from '../../../src/git/repository';
import simpleGit from 'simple-git';

// Mock simple-git
jest.mock('simple-git');

describe('Git Repository Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect a valid Git repository', async () => {
    // Mock implementation
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(true),
      revparse: jest.fn().mockResolvedValue('/path/to/repo'),
    }));

    expect(await isGitRepository('/path/to/repo')).toBe(true);
  });

  it('should return false for non-Git directories', async () => {
    // Mock implementation
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(false),
    }));

    expect(await isGitRepository('/not/a/repo')).toBe(false);
  });

  it('should get the repository root correctly', async () => {
    // Mock implementation
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(true),
      revparse: jest.fn().mockResolvedValue('/path/to/repo'),
    }));

    expect(await getRepositoryRoot('/path/to/repo/subdirectory')).toBe('/path/to/repo');
  });

  it('should handle errors gracefully', async () => {
    // Mock implementation to throw an error
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockRejectedValue(new Error('Git error')),
    }));

    expect(await isGitRepository('/problematic/path')).toBe(false);
  });

  it('should handle nested repositories', async () => {
    // Mock implementation for nested repo scenario
    let callCount = 0;
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockImplementation(() => {
        return Promise.resolve(true);
      }),
      revparse: jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve('/path/to/nested/repo');
        } else {
          return Promise.resolve('/path/to/parent/repo');
        }
      }),
    }));

    const result = await findTopLevelRepository('/path/to/nested/repo');
    expect(result).toBe('/path/to/parent/repo');
  });

  it('should detect if we are in a submodule', async () => {
    // Mock implementation for submodule detection
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(true),
      revparse: jest.fn().mockResolvedValue('/path/to/submodule'),
      raw: jest.fn().mockImplementation((args) => {
        if (args.includes('rev-parse') && args.includes('--show-superproject-working-tree')) {
          return Promise.resolve('/path/to/parent');
        }
        return Promise.resolve('');
      }),
    }));

    expect(await isSubmodule('/path/to/submodule')).toBe(true);
  });

  it('should validate repository health', async () => {
    // Mock implementation
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(true),
      raw: jest.fn().mockImplementation((args) => {
        if (args.includes('rev-parse') && args.includes('--is-bare-repository')) {
          return Promise.resolve('false');
        }
        return Promise.resolve('');
      }),
    }));

    expect(await validateRepository('/valid/repo')).toEqual({
      isValid: true,
      errors: [],
    });
  });

  it('should detect bare repositories', async () => {
    // Mock implementation for bare repository
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(true),
      raw: jest.fn().mockImplementation((args) => {
        if (args.includes('rev-parse') && args.includes('--is-bare-repository')) {
          return Promise.resolve('true');
        }
        return Promise.resolve('');
      }),
    }));

    const validation = await validateRepository('/bare/repo');
    expect(validation.isValid).toBe(false);
    expect(validation.errors).toContain('Cannot commit in a bare repository');
  });

  it('should return repository status correctly', async () => {
    // Mock implementation
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(true),
      revparse: jest.fn().mockResolvedValue('/path/to/repo'),
      status: jest.fn().mockResolvedValue({
        current: 'main',
        isClean: jest.fn().mockReturnValue(true),
      }),
    }));

    const status = await getRepositoryStatus('/path/to/repo');
    expect(status).toEqual({
      isRepo: true,
      root: '/path/to/repo',
      currentBranch: 'main',
      isClean: true,
    });
  });

  it('should return appropriate status for non-repo', async () => {
    // Mock implementation
    (simpleGit as jest.Mock).mockImplementation(() => ({
      checkIsRepo: jest.fn().mockResolvedValue(false),
    }));

    const status = await getRepositoryStatus('/not/a/repo');
    expect(status).toEqual({
      isRepo: false,
      root: null,
      currentBranch: null,
      isClean: false,
    });
  });
});
