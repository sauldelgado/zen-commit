import React from 'react';
import { render } from 'ink-testing-library';
import { CommitMessageInput } from '@ui/components';

// Mock the dependencies
jest.mock('@ui/components/QualityIndicator', () => {
  return function MockQualityIndicator({ score, label }) {
    return (
      <div data-testid="quality-indicator">
        {label}: {score}
      </div>
    );
  };
});

jest.mock('@ui/components/ValidationSummary', () => {
  return function MockValidationSummary({ validation, expanded }) {
    return (
      <div data-testid="validation-summary" data-expanded={expanded}>
        Validation Summary (expanded: {expanded ? 'true' : 'false'})
        {validation && <div>{JSON.stringify(validation)}</div>}
      </div>
    );
  };
});

jest.mock('@ui/components/MessageValidator', () => {
  return function MockMessageValidator({ message, conventionalCommit }) {
    return (
      <div data-testid="message-validator">
        Validating: {message}
        {conventionalCommit && <div>Using conventional commit format</div>}
      </div>
    );
  };
});

jest.mock('@ui/components/CharacterCounter', () => {
  return function MockCharacterCounter({
    current,
    limit,
    showWarning,
  }: {
    current: number;
    limit?: number;
    showWarning?: boolean;
  }) {
    return (
      <div data-testid="char-counter">
        {current}/{limit} {showWarning ? 'WARNING' : ''}
      </div>
    );
  };
});

jest.mock('@ui/hooks/useMessageValidation', () => {
  return jest.fn().mockReturnValue({
    isValid: true,
    messages: [],
    qualityScore: 0.75,
    isSubjectTooLong: false,
    isConventionalCommit: true,
    suggestions: [],
  });
});

describe('CommitMessageInput Component', () => {
  it('should render the commit message input field', () => {
    const { lastFrame } = render(<CommitMessageInput value="" onChange={() => {}} />);
    expect(lastFrame()).toContain('Commit message');
  });

  it('should call onChange when input changes', () => {
    const onChange = jest.fn();
    const { stdin } = render(<CommitMessageInput value="" onChange={onChange} />);

    stdin.write('Test commit message');
    expect(onChange).toHaveBeenCalledWith('Test commit message');
  });

  it('should display the provided value', () => {
    const { lastFrame } = render(<CommitMessageInput value="Initial commit" onChange={() => {}} />);
    expect(lastFrame()).toContain('Initial commit');
  });

  it('should accept a placeholder value', () => {
    const { lastFrame } = render(
      <CommitMessageInput value="" onChange={() => {}} placeholder="Custom placeholder" />,
    );
    expect(lastFrame()).toContain('Custom placeholder');
  });

  it('should call onSubmit when Enter is pressed', () => {
    const onSubmit = jest.fn();
    const { stdin } = render(
      <CommitMessageInput value="Test message" onChange={() => {}} onSubmit={onSubmit} />,
    );

    stdin.write('\r');
    expect(onSubmit).toHaveBeenCalledWith('Test message');
  });

  it('should display visual feedback when enabled', () => {
    const { lastFrame } = render(
      <CommitMessageInput value="feat: add new feature" onChange={() => {}} showFeedback={true} />,
    );

    // Check that visual feedback is displayed
    expect(lastFrame()).toContain('Quality');
  });

  it('should not display feedback when disabled', () => {
    const { lastFrame } = render(
      <CommitMessageInput value="feat: add new feature" onChange={() => {}} showFeedback={false} />,
    );

    // Check that visual feedback is not displayed
    expect(lastFrame()).not.toContain('Quality');
  });

  describe('with subject/body separation', () => {
    it('should show subject and body fields when enabled', () => {
      const { lastFrame } = render(
        <CommitMessageInput value="" onChange={() => {}} showSubjectBodySeparation />,
      );

      expect(lastFrame()).toContain('Subject');
      expect(lastFrame()).toContain('Body');
    });

    it('should show subject line length warning when too long', () => {
      const { lastFrame } = render(
        <CommitMessageInput
          value="This is a very long subject line that exceeds the recommended length limit for good commit messages"
          onChange={() => {}}
          showSubjectBodySeparation
          subjectLimit={50}
        />,
      );

      expect(lastFrame()).toContain('Subject line too long');
    });

    it('should separate subject and body in the value', () => {
      const onChange = jest.fn();
      const { lastFrame, stdin } = render(
        <CommitMessageInput value="Subject line" onChange={onChange} showSubjectBodySeparation />,
      );

      // We should be focused on subject initially
      expect(lastFrame()).toContain('Subject line');

      // Type in the body after switching to body field
      // (In real implementation, we'll need to handle key events)
      stdin.write('\t'); // Tab key to switch to body
      stdin.write('Body text');

      // The onChange should be called with both subject and body
      expect(onChange).toHaveBeenCalledWith('Subject line\nBody text');
    });

    it('should allow navigation between subject and body fields', () => {
      const { stdin, lastFrame } = render(
        <CommitMessageInput
          value="Subject line\nBody text"
          onChange={() => {}}
          showSubjectBodySeparation
        />,
      );

      // Default focus should be on subject
      expect(lastFrame()).toContain('Subject');

      // Tab to body and check that it contains body text
      stdin.write('\t');

      // We need to check the behavior in the implementation
      // since we can't easily check the focus state in tests
    });
  });

  describe('with visual feedback', () => {
    it('should respect feedbackExpanded prop', () => {
      const { lastFrame: collapsedFrame } = render(
        <CommitMessageInput
          value="feat: add new feature"
          onChange={() => {}}
          showFeedback={true}
          showValidation={true}
          feedbackExpanded={false}
        />,
      );

      const { lastFrame: expandedFrame } = render(
        <CommitMessageInput
          value="feat: add new feature"
          onChange={() => {}}
          showFeedback={true}
          showValidation={true}
          feedbackExpanded={true}
        />,
      );

      // Check for the expanded status in the output
      expect(collapsedFrame()).toContain('expanded: false');
      expect(expandedFrame()).toContain('expanded: true');
    });

    it('should show validation summary when showValidation is true', () => {
      const { lastFrame } = render(
        <CommitMessageInput
          value="feat: add new feature"
          onChange={() => {}}
          showFeedback={true}
          showValidation={true}
        />,
      );

      expect(lastFrame()).toContain('Validation Summary');
    });

    it('should not show validation summary when showValidation is false', () => {
      const { lastFrame } = render(
        <CommitMessageInput
          value="feat: add new feature"
          onChange={() => {}}
          showFeedback={true}
          showValidation={false}
        />,
      );

      expect(lastFrame()).not.toContain('Validation Summary');
    });
  });
});
