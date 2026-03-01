import { useState, useEffect } from "react";

const BASE_VIEWS: Record<string, number> = {
  "the-silence-between-words": 3812,
  "on-becoming-a-morning-person": 2147,
  "the-aesthetics-of-restraint": 4290,
  "letters-i-never-sent": 1836,
  "a-city-in-winter": 2553,
  "what-reading-teaches": 1902,
};

export function useViewCount(slug: string) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    const key = `nigar_views_${slug}`;
    const stored = localStorage.getItem(key);
    const base = BASE_VIEWS[slug] ?? 1000;
    const current = stored ? parseInt(stored, 10) : base;
    const updated = current + 1;
    localStorage.setItem(key, String(updated));
    // Animate with a small delay
    const timer = setTimeout(() => setViews(updated), 300);
    return () => clearTimeout(timer);
  }, [slug]);

  return views;
}

export function getStoredViews(slug: string): number {
  const key = `nigar_views_${slug}`;
  const stored = localStorage.getItem(key);
  const base = BASE_VIEWS[slug] ?? 1000;
  return stored ? parseInt(stored, 10) : base;
}
