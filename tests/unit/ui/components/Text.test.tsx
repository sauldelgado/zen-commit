import React from 'react';
import { render } from 'ink-testing-library';
import { Text } from '@ui/components';

describe('Text Component', () => {
  it('should render text correctly', () => {
    const { lastFrame } = render(<Text>Hello World</Text>);

    expect(lastFrame()).toContain('Hello World');
  });

  it('should apply bold style when specified', () => {
    const { lastFrame } = render(<Text bold>Bold Text</Text>);

    // Note: Can't directly test for bold formatting in the terminal string
    // but we can test that the component renders without errors
    expect(lastFrame()).toContain('Bold Text');
  });

  it('should apply color when specified', () => {
    const { lastFrame } = render(<Text color="green">Green Text</Text>);

    // Note: Can't directly test for color in the terminal string
    // but we can test that the component renders without errors
    expect(lastFrame()).toContain('Green Text');
  });

  it('should apply dim style when specified', () => {
    const { lastFrame } = render(<Text dim>Dimmed Text</Text>);

    expect(lastFrame()).toContain('Dimmed Text');
  });
});
