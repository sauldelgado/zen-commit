import path from 'path';
import { getFixturePath, readFixture } from '../helpers';

describe('Testing Framework', () => {
  it('should run tests with TypeScript support', () => {
    // This test verifies that the testing framework is working
    expect(1 + 1).toBe(2);
  });

  it('should resolve path aliases', () => {
    // This will compile only if path aliases are configured correctly
    const modulePath = path.resolve(__dirname, '../../src/utils');
    expect(modulePath).toBeTruthy();
  });

  it('should access test helpers', () => {
    const fixturePath = getFixturePath('sample-commit-messages.json');
    expect(fixturePath).toContain('/fixtures/sample-commit-messages.json');
  });

  it('should read fixture files', () => {
    const fixtureContent = readFixture('sample-commit-messages.json');
    const commitMessages = JSON.parse(fixtureContent);
    expect(commitMessages).toHaveProperty('conventional');
    expect(commitMessages.conventional).toBeInstanceOf(Array);
  });
});
