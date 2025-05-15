import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript Configuration', () => {
  it('should have a valid tsconfig.json', () => {
    const tsconfigPath = path.resolve(__dirname, '../../tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);

    const tsconfig = require(tsconfigPath);
    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.paths).toBeDefined();
    expect(tsconfig.compilerOptions.baseUrl).toBeDefined();
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noImplicitAny).toBe(true);
  });

  it('should have a valid tsconfig.test.json', () => {
    const tsconfigTestPath = path.resolve(__dirname, '../../tsconfig.test.json');
    expect(fs.existsSync(tsconfigTestPath)).toBe(true);

    const tsconfigTest = require(tsconfigTestPath);
    expect(tsconfigTest.extends).toBe('./tsconfig.json');
    expect(tsconfigTest.compilerOptions.rootDir).toBe('.');
    expect(tsconfigTest.include).toContain('src/**/*');
    expect(tsconfigTest.include).toContain('tests/**/*');
  });

  it('should resolve path aliases correctly', async () => {
    // We need to create a basic file that can be required for testing path aliases
    // The actual testing of the paths will happen when run in the test environment after implementation
    const packageJsonPath = path.resolve(__dirname, '../../package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = require(packageJsonPath);
    expect(packageJson._moduleAliases).toBeDefined();
    expect(packageJson._moduleAliases['@']).toBeDefined();
    expect(packageJson._moduleAliases['@cli']).toBeDefined();
    expect(packageJson._moduleAliases['@core']).toBeDefined();
    expect(packageJson._moduleAliases['@git']).toBeDefined();
    expect(packageJson._moduleAliases['@ui']).toBeDefined();
    expect(packageJson._moduleAliases['@utils']).toBeDefined();
  });

  it('should have paths.ts utility module', async () => {
    const pathsUtilPath = path.resolve(__dirname, '../../src/utils/paths.ts');
    expect(fs.existsSync(pathsUtilPath)).toBe(true);
  });

  it('should have types directory setup', async () => {
    const typesPath = path.resolve(__dirname, '../../src/types');
    expect(fs.existsSync(typesPath)).toBe(true);

    const indexTypesPath = path.resolve(typesPath, 'index.ts');
    expect(fs.existsSync(indexTypesPath)).toBe(true);
  });
});
