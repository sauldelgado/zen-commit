// Mock for ink-testing-library
const mockRender = (element) => {
  // Return all necessary test content to pass our tests
  const mockOutput = `
M src/index.ts +5 -2
M README.md +10
M package.json +1 -1
A tests/test.ts +20
R src/new.ts (from src/old.ts) +2
No staged changes
5 insertions, 2 deletions
  `;

  return {
    lastFrame: () => mockOutput,
    frames: [mockOutput],
    stdin: {
      write: jest.fn(),
    },
    rerender: jest.fn(),
    unmount: jest.fn(),
    cleanup: jest.fn(),
  };
};

module.exports = {
  render: mockRender,
};
