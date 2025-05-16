import React from 'react';
import { render } from 'ink-testing-library';
import { CharacterCounter } from '@ui/components';

// Mock the Text and Box components for testing
jest.mock('@ui/components/Text', () => {
  return function MockText({ children, color }) {
    return <span data-color={color}>{children}</span>;
  };
});

jest.mock('@ui/components/Box', () => {
  return function MockBox({ children, marginRight, marginLeft }) {
    return (
      <div data-margin-right={marginRight} data-margin-left={marginLeft}>
        {children}
      </div>
    );
  };
});

describe('CharacterCounter Component', () => {
  it('should display current character count', () => {
    const { lastFrame } = render(<CharacterCounter current={25} />);

    expect(lastFrame()).toContain('25');
  });

  it('should display limit when provided', () => {
    const { lastFrame } = render(<CharacterCounter current={25} limit={50} />);

    expect(lastFrame()).toContain('25/50');
  });

  it('should display label when provided', () => {
    const { lastFrame } = render(<CharacterCounter current={25} label="Subject" />);

    expect(lastFrame()).toContain('Subject');
  });

  it('should change color based on limit proximity', () => {
    // Below 80% of limit - should be green
    const { lastFrame: goodFrame } = render(<CharacterCounter current={30} limit={50} />);

    // Between 80-100% of limit - should be yellow
    const { lastFrame: warningFrame } = render(<CharacterCounter current={45} limit={50} />);

    // Over limit - should be red
    const { lastFrame: errorFrame } = render(<CharacterCounter current={55} limit={50} />);

    // We can't directly test colors in the output, but we can check
    // that the component renders successfully with different values
    expect(goodFrame()).toContain('30/50');
    expect(warningFrame()).toContain('45/50');
    expect(errorFrame()).toContain('55/50');

    // Check for color attribute in the rendered output
    expect(goodFrame()).toContain('data-color="green"');
    expect(warningFrame()).toContain('data-color="yellow"');
    expect(errorFrame()).toContain('data-color="red"');
  });

  it('should show warning message when over limit', () => {
    const { lastFrame } = render(<CharacterCounter current={55} limit={50} showWarning={true} />);

    expect(lastFrame()).toContain('Too long');
  });

  it('should not show warning message when disabled', () => {
    const { lastFrame } = render(<CharacterCounter current={55} limit={50} showWarning={false} />);

    expect(lastFrame()).not.toContain('Too long');
  });

  it('should not show limit when not provided', () => {
    const { lastFrame } = render(<CharacterCounter current={25} />);

    expect(lastFrame()).not.toContain('/');
  });

  it('should not show label when not provided', () => {
    const { lastFrame: withLabel } = render(<CharacterCounter current={25} label="Label" />);
    const { lastFrame: withoutLabel } = render(<CharacterCounter current={25} />);

    expect(withLabel()).toContain('Label');
    expect(withoutLabel()).not.toContain('Label');
  });
});
