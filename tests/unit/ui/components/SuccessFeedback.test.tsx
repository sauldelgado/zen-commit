import React from 'react';
import { render } from 'ink-testing-library';
import { SuccessFeedback } from '@ui/components';

// Mock modules to avoid test failures
jest.mock('ink-select-input', () => {
  const React = require('react');
  return function MockSelectInput(props: { items: Array<{ label: string }> }): JSX.Element {
    return React.createElement(
      'div',
      { 'data-testid': 'select' },
      JSON.stringify(props.items.map((item) => item.label)),
    );
  };
});

describe('SuccessFeedback Component', () => {
  it('should render the success feedback with commit information', () => {
    const { lastFrame } = render(
      <SuccessFeedback
        title="Commit Successful"
        message="Your changes have been committed"
        commitHash="abc1234"
        onDismiss={() => {}}
      />,
    );

    expect(lastFrame()).toContain('Commit Successful');
    expect(lastFrame()).toContain('Your changes have been committed');
    expect(lastFrame()).toContain('abc1234');
  });

  it('should include a dismiss button', () => {
    const { lastFrame } = render(
      <SuccessFeedback
        title="Commit Successful"
        message="Your changes have been committed"
        commitHash="abc1234"
        onDismiss={() => {}}
      />,
    );

    expect(lastFrame()).toContain('OK');
  });

  it('should display next step suggestions', () => {
    const nextSteps = [
      'Push your changes with "git push"',
      'Create a new branch with "git checkout -b new-branch"',
      'Check your commit history with "git log"',
    ];

    const { lastFrame } = render(
      <SuccessFeedback
        title="Commit Successful"
        message="Your changes have been committed"
        commitHash="abc1234"
        nextSteps={nextSteps}
        onDismiss={() => {}}
      />,
    );

    expect(lastFrame()).toContain('Next Steps:');
    nextSteps.forEach((step) => {
      expect(lastFrame()).toContain(step);
    });
  });

  it('should call onDismiss when OK is selected', () => {
    const onDismiss = jest.fn();

    const { stdin } = render(
      <SuccessFeedback
        title="Commit Successful"
        message="Your changes have been committed"
        commitHash="abc1234"
        onDismiss={onDismiss}
      />,
    );

    // Simulate entering the ENTER key to select "OK"
    stdin.write('\r');

    expect(onDismiss).toHaveBeenCalled();
  });
});
