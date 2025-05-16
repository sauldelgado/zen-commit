import React from 'react';
import { render } from 'ink-testing-library';
import { CommitScreen } from '../../src/cli/screens';

describe('Commit Flow Integration', () => {
  it('should show confirmation dialog after entering a commit message', () => {
    const { stdin, lastFrame } = render(<CommitScreen />);

    // Type a commit message
    stdin.write('feat: implement new feature');

    // Submit the message
    stdin.write('\r');

    // Check that the confirmation screen is shown
    const frame = lastFrame() || '';
    expect(frame).toContain('Confirm Commit');
    expect(frame).toContain('feat: implement new feature');
  });

  it('should not show confirmation dialog if commit message is empty', () => {
    const { stdin, lastFrame } = render(<CommitScreen />);

    // Submit an empty message
    stdin.write('\r');

    // Check that we're still on the commit message input screen
    const frame = lastFrame() || '';
    expect(frame).not.toContain('Confirm Commit');
    expect(frame).toContain('Subject:');
  });

  it('should handle the complete commit flow', () => {
    const { stdin, lastFrame } = render(<CommitScreen />);

    // Type a commit message
    stdin.write('feat: implement new feature');

    // Submit the message
    stdin.write('\r');

    // Check that confirmation screen is shown
    let frame = lastFrame() || '';
    expect(frame).toContain('Confirm Commit');

    // Press 'y' to confirm
    stdin.write('y');

    // Check that we're back to the commit message input screen
    // (in a real app, might show a success screen instead)
    frame = lastFrame() || '';
    expect(frame).not.toContain('Confirm Commit');
  });

  it('should allow canceling the commit', () => {
    const { stdin, lastFrame } = render(<CommitScreen />);

    // Type a commit message
    stdin.write('feat: implement new feature');

    // Submit the message
    stdin.write('\r');

    // Check that confirmation screen is shown
    let frame = lastFrame() || '';
    expect(frame).toContain('Confirm Commit');

    // Press 'n' to cancel
    stdin.write('n');

    // Check that we're back to the commit screen
    frame = lastFrame() || '';
    expect(frame).not.toContain('Confirm Commit');
    // When cancelled, we return to the input screen
    expect(frame).toContain('Subject:');
  });
});
