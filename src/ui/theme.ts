/**
 * Theme definition for Zen Commit UI
 */
export interface Theme {
  // Colors
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    muted: string;
    // Git-specific colors
    added: string;
    modified: string;
    deleted: string;
    // UI colors
    background: string;
    foreground: string;
    border: string;
  };
  // Typography
  text: {
    heading: {
      color: string;
      bold: boolean;
    };
    normal: {
      color: string;
    };
    muted: {
      color: string;
    };
  };
  // Spacing
  spacing: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * Deep partial type to allow partial theme definitions
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Default theme for Zen Commit
 */
export const defaultTheme: Theme = {
  colors: {
    primary: 'blue',
    secondary: 'magenta',
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'cyan',
    muted: 'gray',
    // Git-specific colors
    added: 'green',
    modified: 'yellow',
    deleted: 'red',
    // UI colors
    background: 'black',
    foreground: 'white',
    border: 'gray',
  },
  text: {
    heading: {
      color: 'white',
      bold: true,
    },
    normal: {
      color: 'white',
    },
    muted: {
      color: 'gray',
    },
  },
  spacing: {
    small: 1,
    medium: 2,
    large: 3,
  },
};

/**
 * Current active theme
 */
let currentTheme = defaultTheme;

/**
 * Get the current theme
 * @returns The current theme
 */
export const getTheme = (): Theme => {
  return currentTheme;
};

/**
 * Set the current theme
 * @param theme The theme to set
 */
export const setTheme = (theme: Partial<Theme>): void => {
  currentTheme = { ...currentTheme, ...theme };
};
