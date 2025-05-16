// Mock UI components for tests
const React = require('react');

// Mock components
const DiffView = jest.fn().mockImplementation(({ diff }) => {
  return React.createElement('div', { testID: 'diffView', diff });
});

const FileDiffList = jest.fn().mockImplementation(({ changes, repoPath, loading }) => {
  return React.createElement('div', {
    testID: 'fileDiffList',
    'data-changes': JSON.stringify(changes),
    'data-repo-path': repoPath,
    'data-loading': loading,
  });
});

const SuccessFeedback = jest
  .fn()
  .mockImplementation(({ title, message, commitHash, nextSteps }) => {
    return React.createElement(
      'div',
      {
        testID: 'successFeedback',
        'data-title': title,
        'data-message': message,
        'data-commit-hash': commitHash,
        'data-next-steps': JSON.stringify(nextSteps || []),
      },
      [
        React.createElement('div', { key: 'title' }, title),
        React.createElement('div', { key: 'message' }, message),
        React.createElement('div', { key: 'hash' }, `Commit hash: ${commitHash}`),
        ...(nextSteps || []).map((step, i) =>
          React.createElement('div', { key: `step-${i}` }, step),
        ),
      ],
    );
  });

module.exports = {
  DiffView,
  FileDiffList,
  SuccessFeedback,
};
