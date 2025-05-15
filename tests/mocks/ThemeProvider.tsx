import React, { ReactNode } from 'react';
import { ThemeProvider as InkThemeProvider } from 'ink';
import { theme } from '../../src/ui/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <InkThemeProvider theme={theme}>{children}</InkThemeProvider>;
};

export default ThemeProvider;
