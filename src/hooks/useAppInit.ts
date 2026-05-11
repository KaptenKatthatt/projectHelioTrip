import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import { parseShareLink } from "../lib/shareLink";
import { analytics } from "../lib/analytics";

export const useAppInit = () => {
  const locale = useStore((s) => s.locale);
  const appStartMsRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    appStartMsRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const snapshot = parseShareLink(window.location.search);
    if (!snapshot) return;
    useStore.getState().restoreFromShareLink(snapshot);
    const cleanUrl =
      window.location.origin + window.location.pathname + window.location.hash;
    window.history.replaceState(null, "", cleanUrl);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    analytics.deviceType(isMobile ? "mobile" : "desktop");

    const hour = new Date().getHours();
    let timeOfDay: "morning" | "afternoon" | "evening" | "night" = "night";
    if (hour >= 6 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    else if (hour >= 18 && hour < 22) timeOfDay = "evening";

    analytics.timeOfDay(timeOfDay);
  }, []);

  return { appStartMsRef };
};
