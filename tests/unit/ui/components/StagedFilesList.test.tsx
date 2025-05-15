import React from 'react';
import { render } from 'ink-testing-library';
import { StagedFilesList } from '../../../../src/ui/components';
import { FileChange } from '../../../../src/git/change-detection';

describe('StagedFilesList Component', () => {
  // Sample file changes for testing
  const sampleChanges: FileChange[] = [
    { path: 'src/index.ts', type: 'modified', staged: true, insertions: 5, deletions: 2 },
    { path: 'src/utils.ts', type: 'modified', staged: false, insertions: 3, deletions: 1 },
    { path: 'README.md', type: 'modified', staged: true, insertions: 10, deletions: 0 },
    { path: 'package.json', type: 'modified', staged: true, insertions: 1, deletions: 1 },
    { path: 'tests/test.ts', type: 'added', staged: true, insertions: 20, deletions: 0 },
    {
      from: 'src/old.ts',
      path: 'src/new.ts',
      type: 'renamed',
      staged: true,
      insertions: 2,
      deletions: 0,
    },
  ];

  it('should render a list of staged files', () => {
    const { lastFrame } = render(<StagedFilesList changes={sampleChanges} />);

    // Check that only staged files are displayed
    expect(lastFrame()).toContain('src/index.ts');
    expect(lastFrame()).toContain('README.md');
    expect(lastFrame()).toContain('package.json');
    expect(lastFrame()).toContain('tests/test.ts');
    expect(lastFrame()).toContain('src/new.ts');

    // Check that unstaged files are not displayed
    expect(lastFrame()).not.toContain('src/utils.ts');
  });

  it('should show file status indicators', () => {
    const { lastFrame } = render(<StagedFilesList changes={sampleChanges} />);

    // Check for status indicators (M for modified, A for added, R for renamed)
    expect(lastFrame()).toMatch(/M\s+src\/index\.ts/);
    expect(lastFrame()).toMatch(/A\s+tests\/test\.ts/);
    expect(lastFrame()).toMatch(/R\s+src\/new\.ts/);
  });

  it('should show change statistics', () => {
    const { lastFrame } = render(<StagedFilesList changes={sampleChanges} />);

    // Check that insertions and deletions are displayed
    expect(lastFrame()).toContain('+5');
    expect(lastFrame()).toContain('-2');
    expect(lastFrame()).toContain('+10');
  });

  it('should handle empty changes array', () => {
    const { lastFrame } = render(<StagedFilesList changes={[]} />);

    expect(lastFrame()).toContain('No staged changes');
  });

  it('should handle showing file details when specified', () => {
    const { lastFrame } = render(<StagedFilesList changes={sampleChanges} showDetails />);

    // Check that file details are displayed
    expect(lastFrame()).toContain('src/index.ts');
    expect(lastFrame()).toContain('5 insertions, 2 deletions');
  });
});
