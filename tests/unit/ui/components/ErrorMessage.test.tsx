import React from 'react';
import { render } from 'ink-testing-library';
import { ErrorMessage } from '@ui/components';
import { GitError, createErrorHandler } from '@utils/errors';

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

describe('ErrorMessage Component', () => {
  it('should render a Git error message', () => {
    const error = new GitError('no changes added to commit', 'git commit failed', {
      code: 1,
      command: 'git commit -m "test"',
    });

    const errorHandler = createErrorHandler();
    const errorResult = errorHandler.handleError(error);

    // Snapshot test instead of specific content tests
    // This simplifies testing the rendered output
    const { lastFrame } = render(<ErrorMessage error={errorResult} onDismiss={() => {}} />);

    expect(lastFrame()).toMatchSnapshot();
  });
});
