describe('Initial Project Setup', () => {
  it('should have a valid package.json', () => {
    const pkg = require('../../package.json');
    expect(pkg.name).toBe('zen-commit');
    expect(pkg.version).toBeDefined();
  });
});