import React from 'react';
import { render } from 'ink-testing-library';
import { Box } from '@ui/components';

describe('Box Component', () => {
  it('should render children correctly', () => {
    const { lastFrame } = render(
      <Box>
        <Box.Text>Hello World</Box.Text>
      </Box>,
    );

    expect(lastFrame()).toContain('Hello World');
  });

  it('should apply padding when specified', () => {
    const { lastFrame } = render(
      <Box padding={1}>
        <Box.Text>Padded Text</Box.Text>
      </Box>,
    );

    // Check that there is a line break before and after the text
    // and space before and after the text on the same line
    const frame = lastFrame() || '';
    expect(frame.split('\n').length).toBeGreaterThan(1);
    expect(frame).toMatch(/\s+Padded Text\s+/);
  });

  it('should apply margin when specified', () => {
    const { lastFrame } = render(
      <Box margin={1}>
        <Box.Text>Text with margin</Box.Text>
      </Box>,
    );

    // Check for margin (similar to padding test)
    const frame = lastFrame() || '';
    expect(frame.split('\n').length).toBeGreaterThan(1);
  });

  it('should render borders when specified', () => {
    const { lastFrame } = render(
      <Box borderStyle="single">
        <Box.Text>Bordered Text</Box.Text>
      </Box>,
    );

    // Check for border characters
    const frame = lastFrame() || '';
    expect(frame).toContain('│');
    expect(frame).toContain('─');
  });
});
