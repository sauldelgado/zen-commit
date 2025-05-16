import React from 'react';
import { render } from 'ink-testing-library';
import { ConfirmationDialog } from '../../../../src/ui/components';

describe('ConfirmationDialog Component', () => {
  it('should render the confirmation dialog', () => {
    const { lastFrame } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('Confirm Commit');
    expect(frame).toContain('Are you sure you want to commit these changes?');
    expect(frame).toContain('Yes');
    expect(frame).toContain('No');
  });

  it('should call onConfirm when confirmed', () => {
    const onConfirm = jest.fn();
    const { stdin } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );

    // Press Enter to confirm (default selection is "Yes")
    stdin.write('\r');
    expect(onConfirm).toHaveBeenCalled();
  });

  it('should call onCancel when canceled', () => {
    const onCancel = jest.fn();
    const { stdin } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    // Press 'n' for No
    stdin.write('n');
    expect(onCancel).toHaveBeenCalled();
  });

  it('should display additional content when provided', () => {
    const { lastFrame } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={() => {}}
        onCancel={() => {}}
        content={<div>Additional content goes here</div>}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('Additional content goes here');
  });

  it('should respond to keyboard shortcuts', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { stdin } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    // Press 'y' for yes
    stdin.write('y');
    expect(onConfirm).toHaveBeenCalled();

    onConfirm.mockReset();
    onCancel.mockReset();

    // Press 'n' for no
    stdin.write('n');
    expect(onCancel).toHaveBeenCalled();
  });

  it('should respond to uppercase keyboard shortcuts', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { stdin } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    // Press 'Y' for yes
    stdin.write('Y');
    expect(onConfirm).toHaveBeenCalled();

    onConfirm.mockReset();
    onCancel.mockReset();

    // Press 'N' for no
    stdin.write('N');
    expect(onCancel).toHaveBeenCalled();
  });

  it('should handle escape key to cancel', () => {
    const onCancel = jest.fn();
    const { stdin } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    // Simulate escape key
    stdin.write('\u001b'); // Escape key
    expect(onCancel).toHaveBeenCalled();
  });

  it('should render with custom button text', () => {
    const { lastFrame } = render(
      <ConfirmationDialog
        title="Confirm Commit"
        message="Are you sure you want to commit these changes?"
        onConfirm={() => {}}
        onCancel={() => {}}
        confirmText="Proceed"
        cancelText="Abort"
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('Proceed');
    expect(frame).toContain('Abort');
  });

  it('should handle very long title and message', () => {
    const longTitle =
      'This is an extremely long title that should still be properly rendered in the terminal even though it might wrap to multiple lines';
    const longMessage =
      'This is an extremely long message that contains a lot of text and should still be properly rendered in the terminal even though it will definitely wrap to multiple lines. We need to ensure that such long text is handled gracefully.';

    const { lastFrame } = render(
      <ConfirmationDialog
        title={longTitle}
        message={longMessage}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain(longTitle.substring(0, 30)); // At least part of the title should be rendered
    expect(frame).toContain(longMessage.substring(0, 30)); // At least part of the message should be rendered
  });
});
