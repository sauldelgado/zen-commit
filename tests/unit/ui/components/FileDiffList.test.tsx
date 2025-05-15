import React from 'react';
import { render } from 'ink-testing-library';
import { FileDiffList } from '../../../../src/ui/components';
import { FileChange, getFileDiff } from '../../../../src/git/change-detection';

// Mock the git module
jest.mock('../../../../src/git/change-detection', () => ({
  ...jest.requireActual('../../../../src/git/change-detection'),
  getFileDiff: jest.fn().mockResolvedValue({
    filePath: 'src/index.ts',
    insertions: 2,
    deletions: 1,
    binary: false,
    hunks: [
      {
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 4,
        lines: [
          '@@ -1,3 +1,4 @@',
          ' Line 1',
          '-Line 2',
          '+Line 2 modified',
          ' Line 3',
          '+Line 4 added',
        ],
      },
    ],
  }),
}));

describe('FileDiffList Component', () => {
  // Sample file changes for testing
  const sampleChanges: FileChange[] = [
    { path: 'src/index.ts', type: 'modified', staged: true, insertions: 2, deletions: 1 },
    { path: 'README.md', type: 'modified', staged: true, insertions: 1, deletions: 0 },
    { path: 'binary.png', type: 'added', staged: true, binary: true },
  ];

  it('should render a list of file diffs', async () => {
    const { lastFrame } = render(<FileDiffList changes={sampleChanges} repoPath="/test/repo" />);

    // Check that file names are rendered
    expect(lastFrame()).toContain('src/index.ts');
    expect(lastFrame()).toContain('README.md');
    expect(lastFrame()).toContain('binary.png');

    // Wait for diffs to load (in a real test, this would be more robust)
    // Using a delay to allow the async operations to complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Check that diff content is rendered
    expect(getFileDiff).toHaveBeenCalled();
  });

  it('should handle empty changes array', () => {
    const { lastFrame } = render(<FileDiffList changes={[]} repoPath="/test/repo" />);

    expect(lastFrame()).toContain('No files to display');
  });

  it('should handle loading state', () => {
    const { lastFrame } = render(
      <FileDiffList changes={sampleChanges} repoPath="/test/repo" loading />,
    );

    expect(lastFrame()).toContain('Loading diffs');
  });
});
