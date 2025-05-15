import React from 'react';
import { render } from 'ink-testing-library';
import { Divider } from '@ui/components';

describe('Divider Component', () => {
  it('should render a simple divider', () => {
    const { lastFrame } = render(<Divider />);

    // Should contain repeated divider character
    expect(lastFrame()).toContain('─');
  });

  it('should render a divider with title', () => {
    const { lastFrame } = render(<Divider title="Section Title" />);

    // Should contain title and divider characters
    expect(lastFrame()).toContain('Section Title');
    expect(lastFrame()).toContain('─');
  });

  it('should render a divider with custom character', () => {
    const { lastFrame } = render(<Divider character="=" />);

    // Should contain custom character
    expect(lastFrame()).toContain('=');
  });

  it('should render a divider with specified width', () => {
    const width = 10;
    const { lastFrame } = render(<Divider width={width} />);

    // Should have the specified width of divider characters
    const frame = lastFrame() || '';
    const line = frame.trim();
    expect(line.length).toEqual(width);
  });
});
