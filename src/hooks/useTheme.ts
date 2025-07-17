
import { useState, useEffect } from 'react';
import { useUserSettings } from './useUserSettings';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { settings } = useUserSettings();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved || 'light';
    }
    return 'light';
  });

  // Sync with user settings from database
  useEffect(() => {
    if (settings?.theme && settings.theme !== theme) {
      setTheme(settings.theme as Theme);
    }
  }, [settings?.theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (newTheme: Theme) => {
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      
      if (newTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.classList.add(systemTheme);
        console.log('Applied system theme:', systemTheme);
      } else {
        root.classList.add(newTheme);
        console.log('Applied theme:', newTheme);
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    console.log('Updating theme to:', newTheme);
    setTheme(newTheme);
  };

  return { theme, setTheme: updateTheme };
}
