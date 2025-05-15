module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/', '<rootDir>/tests/'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!(chalk)/)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@cli/(.*)$': '<rootDir>/src/cli/$1',
    '^@core/(.*)$': '<rootDir>/src/core/$1',
    '^@git/(.*)$': '<rootDir>/src/git/$1',
    '^@ui/(.*)$': '<rootDir>/src/ui/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    'ink-testing-library': '<rootDir>/tests/mocks/ink-testing-library.js',
    'ink': '<rootDir>/tests/mocks/ink.js',
    'ink-text-input': '<rootDir>/tests/mocks/ink-text-input.js',
    'ink-select-input': '<rootDir>/tests/mocks/ink-select-input.js',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!**/node_modules/**', '!**/dist/**'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
};
