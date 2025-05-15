// Mock for ink-testing-library
const mockRender = (element) => {
  return {
    lastFrame: () => 'Mocked output',
    frames: ['Mocked output'],
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