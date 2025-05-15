import React from 'react';
import { render } from 'ink-testing-library';
import { QualityIndicator } from '@ui/components';

describe('QualityIndicator Component', () => {
  it('should render progress bar based on quality score', () => {
    const { lastFrame } = render(<QualityIndicator score={0.7} />);

    // Check that progress bar is rendered
    expect(lastFrame()).toContain('███████'); // 70% filled
  });

  it('should use color coding based on quality score', () => {
    const { lastFrame: lowFrame } = render(<QualityIndicator score={0.3} />);

    const { lastFrame: mediumFrame } = render(<QualityIndicator score={0.6} />);

    const { lastFrame: highFrame } = render(<QualityIndicator score={0.9} />);

    // Note: We can't directly test colors in the output, but we can check
    // that the component renders successfully with different scores
    expect(lowFrame()).toContain('███');
    expect(mediumFrame()).toContain('██████');
    expect(highFrame()).toContain('█████████');
  });

  it('should display label when provided', () => {
    const { lastFrame } = render(<QualityIndicator score={0.8} label="Message Quality" />);

    expect(lastFrame()).toContain('Message Quality');
  });

  it('should handle zero and full scores correctly', () => {
    const { lastFrame: zeroFrame } = render(<QualityIndicator score={0} />);

    const { lastFrame: fullFrame } = render(<QualityIndicator score={1} />);

    expect(zeroFrame()).not.toContain('█');
    expect(fullFrame()).toContain('██████████'); // 100% filled
  });
});
