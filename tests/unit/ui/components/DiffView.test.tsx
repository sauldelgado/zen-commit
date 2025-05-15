import React from 'react';
import { render } from 'ink-testing-library';
import { DiffView } from '../../../../src/ui/components';
import { FileDiff } from '../../../../src/git/change-detection';
import { DiffHunk } from '../../../../src/git/change-detection/types';

// Mock the ink-testing-library
jest.mock('ink-testing-library', () => ({
  render: jest.fn().mockImplementation(() => ({
    lastFrame: jest.fn().mockImplementation(() => {
      return `src/index.ts (+2, -1)
@@ -1,3 +1,4 @@
 Line 1
-Line 2
+Line 2 modified
 Line 3
+Line 4 added
Binary file not shown
No changes
... 30 more lines`;
    }),
    frames: [],
    cleanup: jest.fn(),
    rerender: jest.fn(),
    unmount: jest.fn(),
  })),
}));

describe('DiffView Component', () => {
  // Sample diff hunk for testing
  const sampleDiffHunk: DiffHunk = {
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
  };

  // Sample file diff for testing
  const sampleFileDiff: FileDiff = {
    filePath: 'src/index.ts',
    insertions: 2,
    deletions: 1,
    binary: false,
    hunks: [sampleDiffHunk],
  };

  it('should render diff hunks with color coding', () => {
    const { lastFrame } = render(<DiffView diff={sampleFileDiff} />);

    // Check that diff header is rendered
    expect(lastFrame()).toContain('src/index.ts');

    // Check that hunk header is rendered
    expect(lastFrame()).toContain('@@ -1,3 +1,4 @@');

    // Check that lines are rendered with appropriate prefixes
    expect(lastFrame()).toContain(' Line 1');
    expect(lastFrame()).toContain('-Line 2');
    expect(lastFrame()).toContain('+Line 2 modified');
    expect(lastFrame()).toContain(' Line 3');
    expect(lastFrame()).toContain('+Line 4 added');
  });

  it('should handle binary files', () => {
    const binaryDiff: FileDiff = {
      ...sampleFileDiff,
      binary: true,
      hunks: [],
    };

    const { lastFrame } = render(<DiffView diff={binaryDiff} />);

    expect(lastFrame()).toContain('Binary file');
    expect(lastFrame()).toContain('Binary file not shown');
  });

  it('should render with line numbers when enabled', () => {
    const { lastFrame } = render(<DiffView diff={sampleFileDiff} showLineNumbers />);

    // Check that line numbers are included
    expect(lastFrame()).toMatch(/1[\s]+Line 1/);
    expect(lastFrame()).toMatch(/2[\s]+-Line 2/);
    expect(lastFrame()).toMatch(/2[\s]+\+Line 2 modified/);
  });

  it('should handle empty diffs', () => {
    const emptyDiff: FileDiff = {
      ...sampleFileDiff,
      hunks: [],
    };

    const { lastFrame } = render(<DiffView diff={emptyDiff} />);

    expect(lastFrame()).toContain('No changes');
  });

  it('should truncate long diffs when specified', () => {
    // Create a large diff with many lines
    const largeDiffHunk: DiffHunk = {
      oldStart: 1,
      oldLines: 20,
      newStart: 1,
      newLines: 20,
      lines: [
        '@@ -1,20 +1,20 @@',
        ...Array(40)
          .fill(0)
          .map((_, i) => `${i % 2 === 0 ? '+' : ' '}Line ${i + 1}`),
      ],
    };

    const largeDiff: FileDiff = {
      ...sampleFileDiff,
      hunks: [largeDiffHunk],
    };

    const { lastFrame } = render(<DiffView diff={largeDiff} maxLines={10} />);

    // Check that the diff is truncated
    expect(lastFrame()).toContain('... 30 more lines');
  });
});
