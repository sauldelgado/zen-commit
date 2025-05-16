import React from 'react';
import { render } from 'ink-testing-library';
import CommitScreen from '@cli/screens/CommitScreen';
import { createGitOperations } from '@git/operations';

// Mock the git operations module
jest.mock('@git/operations', () => ({
  createGitOperations: jest.fn(),
}));

describe('CommitScreen', () => {
  const mockGetStatus = jest.fn();
  const mockCreateCommit = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementation for git operations
    (createGitOperations as jest.Mock).mockReturnValue({
      getStatus: mockGetStatus,
      createCommit: mockCreateCommit,
    });

    // Default mock responses
    mockGetStatus.mockResolvedValue({
      isClean: false,
      files: [
        { path: 'file1.txt', type: 'added', staged: true },
        { path: 'file2.txt', type: 'modified', staged: true },
      ],
      staged: ['file1.txt', 'file2.txt'],
      modified: [],
      deleted: [],
      untracked: [],
      current: 'main',
      ahead: 0,
      behind: 0,
    });

    mockCreateCommit.mockResolvedValue({
      success: true,
      commitHash: 'abcd1234',
      branch: 'main',
      filesChanged: 2,
    });
  });

  it('renders without crashing', () => {
    // A simple test to verify that CommitScreen can be rendered
    render(<CommitScreen />);

    // This test just verifies that the component renders without throwing
    expect(true).toBe(true);
  });
});
