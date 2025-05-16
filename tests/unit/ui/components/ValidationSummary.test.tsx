import React from 'react';
import { render } from 'ink-testing-library';
import { ValidationSummary } from '@ui/components';
import { ValidationResult } from '@ui/hooks';

// Mock the dependencies
jest.mock('@ui/components/Text', () => {
  return function MockText({ children, color, bold, marginRight }) {
    return (
      <span data-color={color} data-bold={bold} data-margin-right={marginRight}>
        {children}
      </span>
    );
  };
});

jest.mock('@ui/components/Box', () => {
  return function MockBox({ children, flexDirection, marginY, marginBottom, marginLeft }) {
    return (
      <div
        data-flex-direction={flexDirection}
        data-margin-y={marginY}
        data-margin-bottom={marginBottom}
        data-margin-left={marginLeft}
      >
        {children}
      </div>
    );
  };
});

jest.mock('@ui/components/QualityIndicator', () => {
  return function MockQualityIndicator({ score, label, width }) {
    return (
      <div data-testid="quality-indicator" data-width={width}>
        {label}: {Math.round(score * 100)}%
      </div>
    );
  };
});

describe('ValidationSummary Component', () => {
  // Mock validation results
  const goodValidation: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: ['Consider adding more details'],
    qualityScore: 0.9,
    subject: 'feat: add new feature',
    body: 'Implement new functionality that users requested',
    subjectLength: 19,
    bodyLength: 43,
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

  const badValidation: ValidationResult = {
    isValid: false,
    errors: ['Not a valid conventional commit format'],
    warnings: ['Subject line is too long'],
    suggestions: ['Consider using conventional commit format'],
    qualityScore: 0.3,
    subject:
      'This is a very long subject line that exceeds the recommended length for a good commit message',
    body: '',
    subjectLength: 81,
    bodyLength: 0,
    hasBody: false,
    isSubjectTooLong: true,
    isConventionalCommit: false,
    conventionalParts: null,
  };

  it('should display overall status for a good validation', () => {
    const { lastFrame } = render(<ValidationSummary validation={goodValidation} />);

    expect(lastFrame()).toContain('Good commit message');
    expect(lastFrame()).toContain('90%');
  });

  it('should display overall status for a bad validation', () => {
    const { lastFrame } = render(<ValidationSummary validation={badValidation} />);

    expect(lastFrame()).toContain('Issues found');
    expect(lastFrame()).toContain('1 error');
    expect(lastFrame()).toContain('1 warning');
  });

  it('should show/hide details when expanded', () => {
    const { lastFrame: collapsedFrame } = render(
      <ValidationSummary validation={badValidation} expanded={false} />,
    );

    const { lastFrame: expandedFrame } = render(
      <ValidationSummary validation={badValidation} expanded={true} />,
    );

    // Collapsed view shouldn't show details
    expect(collapsedFrame()).not.toContain('Errors:');

    // Expanded view should show details
    expect(expandedFrame()).toContain('Errors:');
    expect(expandedFrame()).toContain('Not a valid conventional commit format');
    expect(expandedFrame()).toContain('Warnings:');
    expect(expandedFrame()).toContain('Subject line is too long');
    expect(expandedFrame()).toContain('Suggestions:');
    expect(expandedFrame()).toContain('Consider using conventional commit format');
  });

  it('should render compact view when specified', () => {
    const { lastFrame: standardView } = render(
      <ValidationSummary validation={goodValidation} compact={false} />,
    );

    const { lastFrame: compactView } = render(
      <ValidationSummary validation={goodValidation} compact={true} />,
    );

    // Check specific attributes of compact view
    expect(standardView()).toContain('data-flex-direction="column"');
    expect(compactView()).toContain('data-flex-direction="row"');
  });

  it('should display emoji indicators based on validation status', () => {
    const { lastFrame: goodFrame } = render(<ValidationSummary validation={goodValidation} />);
    const { lastFrame: badFrame } = render(<ValidationSummary validation={badValidation} />);

    // Good validation should have a checkmark
    expect(goodFrame()).toContain('✅');

    // Bad validation should have a warning
    expect(badFrame()).toContain('⚠️');
  });

  it('should display quality score appropriately', () => {
    const { lastFrame } = render(<ValidationSummary validation={goodValidation} />);

    expect(lastFrame()).toContain('Quality: 90%');
  });

  it('should format error/warning/suggestion counts properly for singular and plural', () => {
    // Single error, warning, suggestion
    const singleIssuesValidation: ValidationResult = {
      ...goodValidation,
      isValid: false,
      errors: ['Error'],
      warnings: ['Warning'],
      suggestions: ['Suggestion'],
    };

    // Multiple errors, warnings, suggestions
    const multipleIssuesValidation: ValidationResult = {
      ...goodValidation,
      isValid: false,
      errors: ['Error 1', 'Error 2'],
      warnings: ['Warning 1', 'Warning 2'],
      suggestions: ['Suggestion 1', 'Suggestion 2'],
    };

    const { lastFrame: singleFrame } = render(
      <ValidationSummary validation={singleIssuesValidation} />,
    );
    const { lastFrame: multipleFrame } = render(
      <ValidationSummary validation={multipleIssuesValidation} />,
    );

    expect(singleFrame()).toContain('1 error');
    expect(singleFrame()).toContain('1 warning');
    expect(singleFrame()).toContain('1 suggestion');

    expect(multipleFrame()).toContain('2 errors');
    expect(multipleFrame()).toContain('2 warnings');
    expect(multipleFrame()).toContain('2 suggestions');
  });
});
