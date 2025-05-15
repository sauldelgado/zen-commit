import React from 'react';
import { render } from 'ink-testing-library';
import { Spinner } from '@ui/components';

describe('Spinner Component', () => {
  it('should render spinner with text', () => {
    const { lastFrame } = render(<Spinner text="Loading..." />);

    expect(lastFrame()).toContain('Loading...');
  });

  it('should render spinner without text', () => {
    const { lastFrame } = render(<Spinner />);

    // Should render something even without text
    expect(lastFrame()).toBeTruthy();
  });
});
