import React, { createContext, useContext, ReactNode } from 'react';
import { defaultTheme, Theme, DeepPartial } from './theme';

// Create theme context
const ThemeContext = createContext<Theme>(defaultTheme);

export interface ThemeProviderProps {
  theme?: DeepPartial<Theme>;
  children: ReactNode;
}

/**
 * Provider for theme context
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
  // Simple manual merge for our use case
  const mergedTheme: Theme = theme
    ? {
        ...defaultTheme,
        colors: {
          ...defaultTheme.colors,
          ...(theme.colors || {}),
        },
        text: theme.text
          ? {
              ...defaultTheme.text,
              heading: {
                ...defaultTheme.text.heading,
                ...(theme.text.heading || {}),
              },
              normal: {
                ...defaultTheme.text.normal,
                ...(theme.text.normal || {}),
              },
              muted: {
                ...defaultTheme.text.muted,
                ...(theme.text.muted || {}),
              },
            }
          : defaultTheme.text,
        spacing: {
          ...defaultTheme.spacing,
          ...(theme.spacing || {}),
        },
      }
    : defaultTheme;

  return <ThemeContext.Provider value={mergedTheme}>{children}</ThemeContext.Provider>;
};

/**
 * Hook for accessing theme
 * @returns The current theme
 */
export const useTheme = (): Theme => {
  return useContext(ThemeContext);
};
