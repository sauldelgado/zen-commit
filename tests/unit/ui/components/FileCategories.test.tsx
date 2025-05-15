import React from 'react';
import { render } from 'ink-testing-library';
import { FileCategories } from '../../../../src/ui/components';
import { FileChange } from '../../../../src/git/change-detection';

describe('FileCategories Component', () => {
  // Sample file changes for testing
  const sampleChanges: FileChange[] = [
    {
      path: 'src/index.ts',
      type: 'modified',
      staged: true,
      fileType: 'source',
      insertions: 5,
      deletions: 2,
    },
    {
      path: 'src/components/Button.tsx',
      type: 'modified',
      staged: true,
      fileType: 'source',
      insertions: 3,
      deletions: 1,
    },
    {
      path: 'README.md',
      type: 'modified',
      staged: true,
      fileType: 'docs',
      insertions: 10,
      deletions: 0,
    },
    {
      path: 'package.json',
      type: 'modified',
      staged: true,
      fileType: 'config',
      insertions: 1,
      deletions: 1,
    },
    {
      path: 'tests/test.ts',
      type: 'added',
      staged: true,
      fileType: 'test',
      insertions: 20,
      deletions: 0,
    },
    {
      path: 'assets/logo.png',
      type: 'added',
      staged: true,
      fileType: 'assets',
      insertions: 0,
      deletions: 0,
      binary: true,
    },
  ];

  it('should render categorized files', () => {
    const { lastFrame } = render(<FileCategories changes={sampleChanges} />);

    // Check category headings
    expect(lastFrame()).toContain('Source Files');
    expect(lastFrame()).toContain('Documentation');
    expect(lastFrame()).toContain('Tests');
    expect(lastFrame()).toContain('Configuration');
    expect(lastFrame()).toContain('Assets');

    // Check file paths under categories
    expect(lastFrame()).toMatch(/Source Files.*src\/index\.ts/s);
    expect(lastFrame()).toMatch(/Documentation.*README\.md/s);
    expect(lastFrame()).toMatch(/Tests.*tests\/test\.ts/s);
    expect(lastFrame()).toMatch(/Configuration.*package\.json/s);
    expect(lastFrame()).toMatch(/Assets.*assets\/logo\.png/s);
  });

  it('should render with custom categories', () => {
    const { lastFrame } = render(
      <FileCategories
        changes={sampleChanges}
        categories={[
          { id: 'source', label: 'Code', fileTypes: ['source'] },
          { id: 'content', label: 'Content', fileTypes: ['docs', 'assets'] },
          { id: 'other', label: 'Other', fileTypes: ['test', 'config'] },
        ]}
      />,
    );

    // Check custom category headings
    expect(lastFrame()).toContain('Code');
    expect(lastFrame()).toContain('Content');
    expect(lastFrame()).toContain('Other');

    // Check file paths under custom categories
    expect(lastFrame()).toMatch(/Code.*src\/index\.ts/s);
    expect(lastFrame()).toMatch(/Content.*README\.md/s);
    expect(lastFrame()).toMatch(/Content.*assets\/logo\.png/s);
    expect(lastFrame()).toMatch(/Other.*tests\/test\.ts/s);
    expect(lastFrame()).toMatch(/Other.*package\.json/s);
  });

  it('should handle empty changes array', () => {
    const { lastFrame } = render(<FileCategories changes={[]} />);

    expect(lastFrame()).toContain('No files to display');
  });

  it('should display change statistics per category', () => {
    const { lastFrame } = render(<FileCategories changes={sampleChanges} showStats />);

    // Check statistics for source files
    expect(lastFrame()).toMatch(/Source Files.*2 files.*8 insertions.*3 deletions/s);
    // Check statistics for tests
    expect(lastFrame()).toMatch(/Tests.*1 file.*20 insertions.*0 deletions/s);
  });

  it('should group by directories when specified', () => {
    const { lastFrame } = render(<FileCategories changes={sampleChanges} groupByDirectory />);

    // Check directory groupings
    expect(lastFrame()).toContain('src/');
    expect(lastFrame()).toContain('src/components/');
    expect(lastFrame()).toContain('tests/');
    expect(lastFrame()).toContain('assets/');
  });
});
