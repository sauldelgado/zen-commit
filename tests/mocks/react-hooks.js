// Mock for react-hooks testing
const defaultHookResult = {
  changes: [
    { path: 'src/index.ts', type: 'modified', staged: true, insertions: 5, deletions: 2 },
    { path: 'src/utils.ts', type: 'modified', staged: false, insertions: 3, deletions: 1 },
  ],
  categories: {
    byType: { source: [], test: [], docs: [], config: [], assets: [], other: [] },
    byChangeType: {
      added: [],
      modified: [],
      deleted: [],
      renamed: [],
      copied: [],
      untracked: [],
      unknown: [],
    },
    staged: ['src/index.ts'],
    unstaged: ['src/utils.ts'],
  },
  stats: null,
  loading: false,
  error: null,
  refreshChanges: jest.fn().mockImplementation(() => Promise.resolve()),
};

const renderHook = (callback) => {
  const result = { current: callback() };

  return {
    result,
    waitForNextUpdate: () => Promise.resolve(),
    rerender: jest.fn(),
    unmount: jest.fn(),
  };
};

const act = (callback) => {
  callback();
};

module.exports = {
  renderHook,
  act,
};
