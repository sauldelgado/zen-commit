import React, { ReactNode } from 'react';
import { defaultTheme } from '../../src/ui/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

// Simple ThemeProvider mock for tests
const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return <>{children}</>; // Just render children without any theme context
};

export default ThemeProvider;
