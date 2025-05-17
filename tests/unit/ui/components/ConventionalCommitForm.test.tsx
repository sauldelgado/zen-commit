import React from 'react';
import { render } from 'ink-testing-library';
import ConventionalCommitForm from '@ui/components/ConventionalCommitForm';

jest.mock('ink-select-input', () => {
  const React = require('react');
  return ({ items }: any) => {
    // Simulated component for testing
    return React.createElement(
      'div',
      { 'data-testid': 'select-input' },
      items.map((item: any, i: number) =>
        React.createElement('div', { key: i, 'data-value': item.value }, item.label),
      ),
    );
  };
});

jest.mock('ink-text-input', () => {
  const React = require('react');
  return function MockTextInput({ value, onChange, onSubmit, placeholder }: any) {
    return React.createElement('input', {
      value,
      onChange,
      onSubmit,
      placeholder,
      'data-testid': 'text-input',
    });
  };
});

describe('ConventionalCommitForm Component', () => {
  it('should render the conventional commit form', () => {
    const { lastFrame } = render(<ConventionalCommitForm value="" onChange={() => {}} />);

    expect(lastFrame()).toContain('Type');
    expect(lastFrame()).toContain('Scope');
    expect(lastFrame()).toContain('Description');
  });

  it('should parse an existing conventional commit', () => {
    const { lastFrame } = render(
      <ConventionalCommitForm value="fix(core): resolve memory leak" onChange={() => {}} />,
    );

    expect(lastFrame()).toContain('fix');
    expect(lastFrame()).toContain('core');
    expect(lastFrame()).toContain('resolve memory leak');
  });

  it('should display validation errors and warnings', () => {
    const { lastFrame } = render(
      <ConventionalCommitForm value="invalid: commit message" onChange={() => {}} />,
    );

    expect(lastFrame()).toContain('Invalid commit type');
  });

  it('should show a preview of the formatted message', () => {
    const { lastFrame } = render(
      <ConventionalCommitForm value="feat(ui): add button component" onChange={() => {}} />,
    );

    expect(lastFrame()).toContain('Preview');
    expect(lastFrame()).toContain('feat(ui): add button component');
  });

  it('should handle breaking changes', () => {
    const { lastFrame } = render(
      <ConventionalCommitForm value="feat(api)!: change response format" onChange={() => {}} />,
    );

    expect(lastFrame()).toContain('Breaking Change');
    expect(lastFrame()).toContain('Yes');
  });
});
