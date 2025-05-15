import React from 'react';
import { render } from 'ink-testing-library';
import MessageValidator from '../../../../src/ui/components/MessageValidator';
import * as hooks from '../../../../src/ui/hooks/useMessageValidation';

// Mock the useMessageValidation hook
jest.mock('../../../../src/ui/hooks/useMessageValidation', () => {
  return {
    useMessageValidation: jest.fn(),
  };
});

describe('MessageValidator Component', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display character count for subject and body', () => {
    // Mock the hook result for this test
    const mockValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      qualityScore: 0.7,
      subject: 'feat: add new feature',
      body: 'This is a detailed description of the feature.',
      subjectLength: 19,
      bodyLength: 46,
      hasBody: true,
      isSubjectTooLong: false,
      isConventionalCommit: true,
      conventionalParts: {
        type: 'feat',
        scope: undefined,
        breaking: false,
        description: 'add new feature',
      },
    };

    // Setup the mock
    (hooks.useMessageValidation as jest.Mock).mockReturnValue(mockValidation);

    const { lastFrame } = render(
      <MessageValidator message="feat: add new feature\n\nThis is a detailed description of the feature." />,
    );

    // Check that character counts are displayed
    expect(lastFrame()).toContain('Subject: 19/50');
    expect(lastFrame()).toContain('Body: 46');
  });

  it('should display warnings for long subject line', () => {
    // Mock the hook result for this test
    const mockValidation = {
      isValid: true,
      errors: [],
      warnings: ['Subject line is too long'],
      suggestions: [],
      qualityScore: 0.5,
      subject:
        'feat: this is a very long subject line that exceeds the recommended length for good commit messages',
      body: '',
      subjectLength: 72,
      bodyLength: 0,
      hasBody: false,
      isSubjectTooLong: true,
      isConventionalCommit: true,
      conventionalParts: {
        type: 'feat',
        scope: undefined,
        breaking: false,
        description:
          'this is a very long subject line that exceeds the recommended length for good commit messages',
      },
    };

    // Setup the mock
    (hooks.useMessageValidation as jest.Mock).mockReturnValue(mockValidation);

    const { lastFrame } = render(
      <MessageValidator message="feat: this is a very long subject line that exceeds the recommended length for good commit messages" />,
    );

    // Check that warning is displayed
    expect(lastFrame()).toContain('Subject too long');
    expect(lastFrame()).toContain('72/50');
  });

  it('should validate conventional commit format when enabled', () => {
    // Mock the hook result for this test
    const mockValidation = {
      isValid: false,
      errors: ['Not a valid conventional commit format'],
      warnings: [],
      suggestions: [],
      qualityScore: 0.3,
      subject: 'add new feature',
      body: '',
      subjectLength: 14,
      bodyLength: 0,
      hasBody: false,
      isSubjectTooLong: false,
      isConventionalCommit: false,
      conventionalParts: null,
    };

    // Setup the mock
    (hooks.useMessageValidation as jest.Mock).mockReturnValue(mockValidation);

    const { lastFrame } = render(<MessageValidator message="add new feature" conventionalCommit />);

    // Check that validation error is displayed
    expect(lastFrame()).toContain('Not a conventional commit');
  });

  it('should recognize valid conventional commit format', () => {
    // Mock the hook result for this test
    const mockValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      qualityScore: 0.8,
      subject: 'feat(ui): add new button component',
      body: '',
      subjectLength: 33,
      bodyLength: 0,
      hasBody: false,
      isSubjectTooLong: false,
      isConventionalCommit: true,
      conventionalParts: {
        type: 'feat',
        scope: 'ui',
        breaking: false,
        description: 'add new button component',
      },
    };

    // Setup the mock
    (hooks.useMessageValidation as jest.Mock).mockReturnValue(mockValidation);

    const { lastFrame } = render(
      <MessageValidator message="feat(ui): add new button component" conventionalCommit />,
    );

    // Check that validation is successful
    expect(lastFrame()).toContain('Valid conventional commit');
  });

  it('should provide suggestions for improving commit message', () => {
    // Mock the hook result for this test
    const mockValidation = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: ['Be more specific about what was changed'],
      qualityScore: 0.4,
      subject: 'fix bug',
      body: '',
      subjectLength: 7,
      bodyLength: 0,
      hasBody: false,
      isSubjectTooLong: false,
      isConventionalCommit: false,
      conventionalParts: null,
    };

    // Setup the mock
    (hooks.useMessageValidation as jest.Mock).mockReturnValue(mockValidation);

    const { lastFrame } = render(<MessageValidator message="fix bug" showSuggestions />);

    // Check that suggestions are displayed
    expect(lastFrame()).toContain('Suggestions');
    expect(lastFrame()).toContain('Be more specific');
  });
});
