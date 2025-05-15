// Mock for ink
const React = require('react');

// Mock Box component
class Box extends React.Component {
  render() {
    return this.props.children || null;
  }
}

// Mock Text component
class Text extends React.Component {
  render() {
    return this.props.children || null;
  }
}

// Mock render function
const render = (element, options = {}) => {
  return {
    unmount: jest.fn(),
    rerender: jest.fn(),
    cleanup: jest.fn(),
    waitUntilExit: jest.fn(),
    frames: ['Mocked output'],
    lastFrame: () => 'Mocked output',
  };
};

module.exports = {
  Box,
  Text,
  render,
  useInput: jest.fn(),
  useApp: jest.fn(() => ({ exit: jest.fn() })),
};