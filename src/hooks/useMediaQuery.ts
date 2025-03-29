import { useEffect, useState } from 'react';

/**
 * Custom hook for responsive design that watches a media query string
 * @param query CSS media query string (e.g. '(min-width: 768px)')
 * @returns Boolean indicating if the media query matches
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // Initial check if window is available (SSR safety)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Skip if window is not available (SSR safety)
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(query);

    // Initial check
    setMatches(mediaQuery.matches);

    // Event listener for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);

    // Cleanup event listener
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * Predefined breakpoints for common screen sizes
 */
export const breakpoints = {
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
};

/**
 * Custom hooks for predefined breakpoints
 */
export const useIsMobile = () => !useMediaQuery(breakpoints.sm);
export const useIsTablet = () => {
  const isSmUp = useMediaQuery(breakpoints.sm);
  const isLgUp = useMediaQuery(breakpoints.lg);
  return isSmUp && !isLgUp;
};
export const useIsDesktop = () => useMediaQuery(breakpoints.lg);

export default useMediaQuery;
