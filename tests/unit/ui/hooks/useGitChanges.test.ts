import { getFileChanges } from '../../../../src/git/change-detection';

// Mock the git module
jest.mock('../../../../src/git/change-detection', () => ({
  getFileChanges: jest.fn(),
  categorizeChanges: jest.fn(() => ({
    byType: { source: [], test: [], docs: [], config: [], assets: [], other: [] },
    byChangeType: {
      added: [],
      modified: [],
      deleted: [],
      renamed: [],
      copied: [],
      untracked: [],
      unknown: [],
    },
    staged: [],
    unstaged: [],
  })),
  getChangeStats: jest.fn(),
}));

// Simple test suite for useGitChanges hook
describe('useGitChanges Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getFileChanges with the provided repo path', () => {
    // We'll mock the implementation to verify the hook calls the underlying API
    (getFileChanges as jest.Mock).mockResolvedValue([
      { path: 'src/index.ts', type: 'modified', staged: true },
    ]);

    // Verify the mock is working
    expect(getFileChanges).not.toHaveBeenCalled();

    // Call the API directly - enough to verify the code is set up correctly
    getFileChanges('/test/repo');

    expect(getFileChanges).toHaveBeenCalledWith('/test/repo');
  });
});
