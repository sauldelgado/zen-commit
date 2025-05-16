import React from 'react';
import { render } from 'ink-testing-library';
import { QualityIndicator } from '@ui/components';

// Mock the dependencies
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

describe('QualityIndicator Component', () => {
  it('should render progress bar based on quality score', () => {
    const { lastFrame } = render(<QualityIndicator score={0.7} width={10} />);

    // Check that progress bar is rendered with filled and empty characters
    // Note: Since we're checking the actual characters, this test will show if the
    // calculation for filledCount is working properly
    expect(lastFrame()).toContain('███████'); // 7 filled characters for 0.7 score
    expect(lastFrame()).toContain('███'); // Ensure some filled characters
  });

  it('should use color coding based on quality score', () => {
    const { lastFrame: lowFrame } = render(<QualityIndicator score={0.3} width={10} />);
    const { lastFrame: mediumFrame } = render(<QualityIndicator score={0.6} width={10} />);
    const { lastFrame: highFrame } = render(<QualityIndicator score={0.9} width={10} />);

    // Check for color attributes in the rendered output
    expect(lowFrame()).toContain('data-color="red"');
    expect(mediumFrame()).toContain('data-color="yellow"');
    expect(highFrame()).toContain('data-color="green"');
  });

  it('should display label when provided', () => {
    const { lastFrame: withLabel } = render(
      <QualityIndicator score={0.8} label="Quality" width={10} />,
    );
    const { lastFrame: withoutLabel } = render(<QualityIndicator score={0.8} width={10} />);

    expect(withLabel()).toContain('Quality');
    expect(withoutLabel()).not.toContain('Quality');
  });

  it('should handle zero and full scores correctly', () => {
    const { lastFrame: zeroFrame } = render(<QualityIndicator score={0} width={10} />);
    const { lastFrame: fullFrame } = render(<QualityIndicator score={1} width={10} />);

    // For zero score, we should see no filled characters in progress bar
    expect(zeroFrame()).toContain('0%');

    // For full score, we should see all filled characters in progress bar
    expect(fullFrame()).toContain('100%');
  });

  it('should respect the width parameter', () => {
    const { lastFrame: narrowBar } = render(<QualityIndicator score={0.5} width={5} />);
    const { lastFrame: wideBar } = render(<QualityIndicator score={0.5} width={20} />);

    // Check that narrow bar has fewer characters than wide bar
    // Since we test direct rendering, we can see if the actual width is respected
    expect(narrowBar()).toContain('░░░'); // Some empty characters in a width=5 bar
    expect(wideBar()).toContain('░░░░░░░░░░'); // More empty characters in a width=20 bar
  });

  it('should normalize scores outside the 0-1 range', () => {
    const { lastFrame: belowZero } = render(<QualityIndicator score={-0.5} width={10} />);
    const { lastFrame: aboveOne } = render(<QualityIndicator score={1.5} width={10} />);

    // Values below 0 should be treated as 0
    expect(belowZero()).toContain('0%');

    // Values above 1 should be treated as 1
    expect(aboveOne()).toContain('100%');
  });

  it('should display the percentage correctly', () => {
    const { lastFrame } = render(<QualityIndicator score={0.75} width={10} />);

    expect(lastFrame()).toContain('75%');
  });
});
