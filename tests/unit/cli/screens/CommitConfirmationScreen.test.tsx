import React from 'react';
import { render } from 'ink-testing-library';
import CommitConfirmationScreen from '../../../../src/cli/screens/CommitConfirmationScreen';

describe('CommitConfirmationScreen', () => {
  it('should render the commit confirmation screen', () => {
    const { lastFrame } = render(
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={[
          { path: 'src/file1.ts', status: 'modified' },
          { path: 'src/file2.ts', status: 'added' },
        ]}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('Confirm Commit');
    expect(frame).toContain('feat: implement new feature');
    expect(frame).toContain('src/file1.ts');
    expect(frame).toContain('src/file2.ts');
  });

  it('should call onConfirm when confirmed', () => {
    const onConfirm = jest.fn();
    const { stdin } = render(
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={[{ path: 'src/file1.ts', status: 'modified' }]}
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
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={[{ path: 'src/file1.ts', status: 'modified' }]}
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );

    // Press 'n' for No
    stdin.write('n');
    expect(onCancel).toHaveBeenCalled();
  });
});
