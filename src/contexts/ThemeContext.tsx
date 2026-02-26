import React from 'react';
import ThemeTransition from '../components/common/ThemeTransition';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'reconnect-theme';

function getSystemPreference(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as Theme | null) : null;
    return saved ?? 'system';
  });
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  const resolvedTheme = theme === 'system' ? getSystemPreference() : theme;

  const applyThemeClass = React.useCallback((resolved: 'light' | 'dark') => {
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  React.useEffect(() => {
    applyThemeClass(resolvedTheme);
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, resolvedTheme, applyThemeClass]);

  React.useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemeClass(media.matches ? 'dark' : 'light');
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, [theme, applyThemeClass]);

  const setTheme = (next: Theme) => setThemeState(next);
  
  const toggleTheme = () => {
    setIsTransitioning(true);
    // Small delay to show animation before theme change
    setTimeout(() => {
      setThemeState(prev => {
        if (prev === 'system') {
          // If system, toggle based on current system preference
          const current = getSystemPreference();
          return current === 'dark' ? 'light' : 'dark';
        }
        // Otherwise, toggle between light and dark
        return prev === 'dark' ? 'light' : 'dark';
      });
    }, 100);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
      <ThemeTransition isActive={isTransitioning} onComplete={handleTransitionComplete} />
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


