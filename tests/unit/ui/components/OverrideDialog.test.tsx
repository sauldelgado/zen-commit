import React from 'react';
import { render } from 'ink-testing-library';
import OverrideDialog from '../../../../src/ui/components/OverrideDialog';
import { PatternMatch } from '../../../../src/core/patterns/pattern-detection';

describe('OverrideDialog Component', () => {
  const warning: PatternMatch = {
    patternId: 'test-warning',
    name: 'Test Warning',
    description: 'This is a test warning',
    severity: 'warning',
    category: 'best-practices',
    index: 0,
    length: 10,
    matchedText: 'Test match',
  };

  it('should render the override dialog with warning details', () => {
    const { lastFrame } = render(
      <OverrideDialog warning={warning} onOverride={() => {}} onCancel={() => {}} />,
    );

    expect(lastFrame()).toContain('Override Warning');
    expect(lastFrame()).toContain('Test Warning');
    expect(lastFrame()).toContain('This is a test warning');
  });

  it('should handle reason input', () => {
    const { lastFrame, stdin } = render(
      <OverrideDialog warning={warning} onOverride={() => {}} onCancel={() => {}} />,
    );

    stdin.write('This is my reason');

    expect(lastFrame()).toContain('This is my reason');
  });

  it('should call onOverride when confirmed with reason', () => {
    const onOverride = jest.fn();
    const { stdin } = render(
      <OverrideDialog warning={warning} onOverride={onOverride} onCancel={() => {}} />,
    );

    // Type a reason
    stdin.write('My override reason');

    // Tab to submit button
    stdin.write('\t');

    // Press Enter to submit
    stdin.write('\r');

    expect(onOverride).toHaveBeenCalledWith('test-warning', 'My override reason', false);
  });

  it('should call onCancel when canceled', () => {
    const onCancel = jest.fn();
    const { stdin } = render(
      <OverrideDialog warning={warning} onOverride={() => {}} onCancel={onCancel} />,
    );

    // Press Escape to cancel
    stdin.write('\u001b'); // ESC character

    expect(onCancel).toHaveBeenCalled();
  });

  it('should show permanent override option when specified', () => {
    const { lastFrame } = render(
      <OverrideDialog
        warning={warning}
        onOverride={() => {}}
        onCancel={() => {}}
        allowPermanentOverride={true}
      />,
    );

    expect(lastFrame()).toContain('Make this override permanent');
  });
});
