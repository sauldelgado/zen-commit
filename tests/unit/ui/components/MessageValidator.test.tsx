import React from 'react';
import { render } from 'ink-testing-library';
import { MessageValidator } from '@ui/components';

describe('MessageValidator Component', () => {
  it('should display character count for subject and body', () => {
    const { lastFrame } = render(
      <MessageValidator message="feat: add new feature\n\nThis is a detailed description of the feature." />,
    );

    // Check that character counts are displayed
    expect(lastFrame()).toContain('Subject: 19/50');
    expect(lastFrame()).toContain('Body: 46');
  });

  it('should display warnings for long subject line', () => {
    const { lastFrame } = render(
      <MessageValidator message="feat: this is a very long subject line that exceeds the recommended length for good commit messages" />,
    );

    // Check that warning is displayed
    expect(lastFrame()).toContain('Subject too long');
    expect(lastFrame()).toContain('72/50');
  });

  it('should validate conventional commit format when enabled', () => {
    const { lastFrame } = render(<MessageValidator message="add new feature" conventionalCommit />);

    // Check that validation error is displayed
    expect(lastFrame()).toContain('Not a conventional commit');
  });

  it('should recognize valid conventional commit format', () => {
    const { lastFrame } = render(
      <MessageValidator message="feat(ui): add new button component" conventionalCommit />,
    );

    // Check that validation is successful
    expect(lastFrame()).toContain('Valid conventional commit');
  });

  it('should provide suggestions for improving commit message', () => {
    const { lastFrame } = render(<MessageValidator message="fix bug" showSuggestions />);

    // Check that suggestions are displayed
    expect(lastFrame()).toContain('Suggestions');
    expect(lastFrame()).toContain('Be more specific');
  });
});
