// This file is executed before all tests

// Increase timeout for all tests
jest.setTimeout(10000);

// Suppress console output during tests (optional)
// Uncomment these lines to suppress console output
// global.console.log = jest.fn();
// global.console.warn = jest.fn();
// global.console.error = jest.fn();

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
