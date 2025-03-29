import { useEffect } from 'react';

import useLocalStorage from './useLocalStorage';

type Theme = 'light' | 'dark';

/**
 * Custom hook for dark/light mode toggle with localStorage persistence
 * and system preference detection
 */
function useDarkMode(defaultTheme: Theme = 'light'): [Theme, () => void] {
  // Use our useLocalStorage hook to persist state through page refresh
  const [theme, setTheme] = useLocalStorage<Theme>('theme', defaultTheme);

  // On mount, check for system preference
  useEffect(() => {
    const userPrefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (userPrefersDark && theme !== 'dark') {
      setTheme('dark');
    }
  }, [theme, setTheme]);

  // Listen for changes in system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setTheme]);

  // Update body class when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [theme]);

  // Provide a toggle function
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return [theme, toggleTheme];
}

export default useDarkMode;
