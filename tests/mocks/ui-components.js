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

module.exports = {
  DiffView,
  FileDiffList,
};
