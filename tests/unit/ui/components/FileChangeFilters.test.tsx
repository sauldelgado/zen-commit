import React from 'react';
import { render } from 'ink-testing-library';
import { FileChangeFilters } from '../../../../src/ui/components';

describe('FileChangeFilters Component', () => {
  it('should render filter options', () => {
    const { lastFrame } = render(
      <FileChangeFilters activeFilters={[]} onFilterChange={() => {}} />,
    );

    // Check filter options
    expect(lastFrame()).toContain('Change Type');
    expect(lastFrame()).toContain('File Type');
    expect(lastFrame()).toContain('Directory');
  });

  it('should highlight active filters', () => {
    const { lastFrame } = render(
      <FileChangeFilters
        activeFilters={['fileType:source', 'changeType:modified']}
        onFilterChange={() => {}}
      />,
    );

    // Check that active filters are highlighted
    expect(lastFrame()).toContain('source'); // Highlighted fileType filter
    expect(lastFrame()).toContain('modified'); // Highlighted changeType filter
  });

  it('should call onFilterChange when a filter is toggled', () => {
    const handleFilterChange = jest.fn();
    const { stdin } = render(
      <FileChangeFilters activeFilters={[]} onFilterChange={handleFilterChange} />,
    );

    // Simulate selecting a filter by pressing Enter
    stdin.write('\r');

    expect(handleFilterChange).toHaveBeenCalled();
  });
});
