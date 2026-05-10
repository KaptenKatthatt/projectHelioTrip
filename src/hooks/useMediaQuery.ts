import { useEffect, useState } from "react";

/**
 * Custom hook to safely use matchMedia and subscribe to changes.
 * Defaults to false if window is undefined (e.g. during SSR).
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(query);
    const onChange = (): void => {
      setMatches(mql.matches);
    };

    // Ensure the state matches the initial value on mount, in case it changed between render and effect
    onChange();
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
};
