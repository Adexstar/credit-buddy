import { useCallback, useEffect, useState } from "react";

const KEY = "tour_completed";

export function useOnboarding() {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);

  useEffect(() => {
    const completed = window.localStorage.getItem(KEY) === "true";
    setHasCompleted(completed);
    if (completed) return;
    const timer = setTimeout(() => setIsTourOpen(true), 900);
    return () => clearTimeout(timer);
  }, []);

  const startTour = useCallback(() => setIsTourOpen(true), []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    setHasCompleted(true);
    window.localStorage.setItem(KEY, "true");
  }, []);

  const resetTour = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setHasCompleted(false);
    setIsTourOpen(true);
  }, []);

  return { isTourOpen, hasCompleted, startTour, closeTour, resetTour };
}
