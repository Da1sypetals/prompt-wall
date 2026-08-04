"use client";

import { useEffect } from "react";

export function useReveal(deps: readonly unknown[] = []) {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".reveal:not(.in)")
    );
    if (els.length === 0) return;

    if (typeof IntersectionObserver === "undefined") {
      els.forEach((el) => el.classList.add("in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
