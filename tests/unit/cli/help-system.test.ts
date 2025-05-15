import { 
  getCommandHelp, 
  getGeneralHelp, 
  getVersionInfo,
  formatHelpText
} from '@cli/help-system';

describe('Help Documentation System', () => {
  describe('getGeneralHelp', () => {
    it('should provide general help text', () => {
      const help = getGeneralHelp();
      
      expect(help).toContain('Usage:');
      expect(help).toContain('zen-commit');
      expect(help).toContain('Commands:');
      expect(help).toContain('commit');
      expect(help).toContain('config');
      expect(help).toContain('Options:');
    });
  });
  
  describe('getCommandHelp', () => {
    it('should provide help for the commit command', () => {
      const help = getCommandHelp('commit');
      
      expect(help).toContain('commit');
      expect(help).toContain('Usage:');
      expect(help).toContain('-m, --message');
    });
    
    it('should provide help for the config command', () => {
      const help = getCommandHelp('config');
      
      expect(help).toContain('config');
      expect(help).toContain('Examples:');
    });
    
    it('should handle unknown commands', () => {
      const help = getCommandHelp('unknown-command' as any);
      
      expect(help).toContain('Command not found');
      expect(help).toContain('Available commands');
    });
  });
  
  describe('getVersionInfo', () => {
    it('should return the current version', () => {
      const versionInfo = getVersionInfo();
      
      expect(versionInfo).toMatch(/Zen Commit v\d+\.\d+\.\d+/);
    });
  });
  
  describe('formatHelpText', () => {
    it('should format command names', () => {
      const formatted = formatHelpText('command: commit');
      
      // This test depends on implementation details of the formatting
      // At minimum, expect the output to contain the original text
      expect(formatted).toContain('commit');
    });
    
    it('should format option flags', () => {
      const formatted = formatHelpText('option: --verbose');
      
      expect(formatted).toContain('--verbose');
    });
  });
});