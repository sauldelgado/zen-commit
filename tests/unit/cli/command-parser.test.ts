import { parseArguments } from '@cli/command-parser';
import { CommitOptions, ConfigOptions } from '@cli/types';

describe('Command Parser', () => {
  it('should parse the default command (commit) when no arguments are provided', () => {
    const result = parseArguments([]);
    expect(result.command).toBe('commit');
    expect(result.options.verbose).toBe(false);
  });

  it('should parse the commit command', () => {
    const result = parseArguments(['commit']);
    expect(result.command).toBe('commit');
  });

  it('should parse the commit command with message option', () => {
    const result = parseArguments(['commit', '-m', 'Initial commit']);
    expect(result.command).toBe('commit');
    expect((result.options as CommitOptions).message).toBe('Initial commit');
  });

  it('should parse global verbose flag', () => {
    const result = parseArguments(['--verbose']);
    expect(result.options.verbose).toBe(true);
  });

  it('should parse global debug flag', () => {
    const result = parseArguments(['--debug']);
    expect(result.options.debug).toBe(true);
  });

  it('should handle unknown options', () => {
    // Commander will throw an error for unknown options by default,
    // but we might want to handle them gracefully
    expect(() => parseArguments(['--unknown-option'])).not.toThrow();
  });

  it('should parse the config command', () => {
    const result = parseArguments(['config', 'set', 'template.scope', 'ui']);
    expect(result.command).toBe('config');
    expect((result.options as ConfigOptions).action).toBe('set');
    expect((result.options as ConfigOptions).key).toBe('template.scope');
    expect((result.options as ConfigOptions).value).toBe('ui');
  });

  it('should parse the help command', () => {
    const result = parseArguments(['help']);
    expect(result.command).toBe('help');
  });

  it('should parse the version command', () => {
    const result = parseArguments(['version']);
    expect(result.command).toBe('version');
  });
});
