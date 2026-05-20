import React, { ReactNode, createContext, useCallback, useMemo, useState } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { Theme, ThemeMode } from '../theme/themeTypes';
import { lightTheme } from '../theme/lightTheme';
import { darkTheme } from '../theme/darkTheme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      themeMode,
      toggleTheme,
      setThemeMode,
    }),
    [theme, themeMode, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
}
