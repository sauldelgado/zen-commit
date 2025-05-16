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

  it('should display all file statuses correctly', () => {
    const { lastFrame } = render(
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={[
          { path: 'src/modified.ts', status: 'modified' },
          { path: 'src/added.ts', status: 'added' },
          { path: 'src/deleted.ts', status: 'deleted' },
          { path: 'src/renamed.ts', status: 'renamed' },
          { path: 'src/copied.ts', status: 'copied' },
          { path: 'src/unknown.ts', status: 'unknown' },
        ]}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';

    // All file paths should be displayed
    expect(frame).toContain('src/modified.ts');
    expect(frame).toContain('src/added.ts');
    expect(frame).toContain('src/deleted.ts');
    expect(frame).toContain('src/renamed.ts');
    expect(frame).toContain('src/copied.ts');
    expect(frame).toContain('src/unknown.ts');

    // Status symbols should be shown
    expect(frame).toContain('M src/modified.ts');
    expect(frame).toContain('A src/added.ts');
    expect(frame).toContain('D src/deleted.ts');
    expect(frame).toContain('R src/renamed.ts');
    expect(frame).toContain('C src/copied.ts');
    expect(frame).toContain('? src/unknown.ts');
  });

  it('should handle a very long commit message', () => {
    const longMessage =
      'feat: This is a very long commit message that exceeds the recommended 50 character limit for the subject line and continues with a lot of additional detailed information in the body that might also be quite lengthy to really test the confirmation screen rendering with extensive content';

    const { lastFrame } = render(
      <CommitConfirmationScreen
        commitMessage={longMessage}
        stagedFiles={[{ path: 'src/file1.ts', status: 'modified' }]}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain(longMessage.substring(0, 40)); // At least part of the message should be displayed
  });

  it('should handle a large number of staged files', () => {
    // Create an array of 100 files
    const manyFiles = Array.from({ length: 100 }, (_, i) => ({
      path: `src/file${i}.ts`,
      status: 'modified' as const,
    }));

    const { lastFrame } = render(
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={manyFiles}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';

    // The screen should display the number of files
    expect(frame).toContain('Staged Files (100)');

    // Check for some of the files
    expect(frame).toContain('src/file0.ts');
    expect(frame).toContain('src/file1.ts');
    // We can't check all 100 files as the output might be truncated,
    // but the component should handle this gracefully
  });

  it('should handle keypress shortcuts correctly', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();

    const { stdin } = render(
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={[{ path: 'src/file.ts', status: 'modified' }]}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    // Test 'y' for confirm
    stdin.write('y');
    expect(onConfirm).toHaveBeenCalled();

    onConfirm.mockReset();
    onCancel.mockReset();

    // Test 'Y' (uppercase) for confirm
    stdin.write('Y');
    expect(onConfirm).toHaveBeenCalled();

    onConfirm.mockReset();
    onCancel.mockReset();

    // Test 'n' for cancel
    stdin.write('n');
    expect(onCancel).toHaveBeenCalled();

    onConfirm.mockReset();
    onCancel.mockReset();

    // Test 'N' (uppercase) for cancel
    stdin.write('N');
    expect(onCancel).toHaveBeenCalled();

    onConfirm.mockReset();
    onCancel.mockReset();

    // Test escape key for cancel
    stdin.write('\u001b'); // Escape key
    expect(onCancel).toHaveBeenCalled();
  });

  it('should handle empty staged files array gracefully', () => {
    const { lastFrame } = render(
      <CommitConfirmationScreen
        commitMessage="feat: implement new feature"
        stagedFiles={[]}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );

    const frame = lastFrame() || '';
    expect(frame).toContain('Staged Files (0)');
  });
});
