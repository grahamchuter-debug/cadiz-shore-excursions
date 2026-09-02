"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** Instant top scroll — html uses scroll-behavior: smooth globally. */
export function scrollToTopInstant() {
  if (typeof window === "undefined") return;
  if (window.location.hash) return;
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

/** Beat Next.js layout-router segment scrollIntoView after soft navigations. */
export function scheduleScrollReset() {
  scrollToTopInstant();
  requestAnimationFrame(scrollToTopInstant);
  requestAnimationFrame(() => requestAnimationFrame(scrollToTopInstant));
}

/**
 * Resets scroll on client navigations. pathname subscription covers remount-less
 * layout segments; capture-phase link clicks cover static-export hub → product.
 */
export function NavigationScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    scheduleScrollReset();
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let lastPath = window.location.pathname + window.location.search;

    const onRouteChange = () => {
      const nextPath = window.location.pathname + window.location.search;
      if (nextPath === lastPath) return;
      lastPath = nextPath;
      scheduleScrollReset();
      window.setTimeout(scheduleScrollReset, 0);
      window.setTimeout(scheduleScrollReset, 50);
      window.setTimeout(scheduleScrollReset, 150);
    };

    const intervalId = window.setInterval(onRouteChange, 100);
    window.addEventListener("popstate", onRouteChange);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("popstate", onRouteChange);
    };
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const next = url.pathname + url.search;
      const current = window.location.pathname + window.location.search;
      if (next === current) return;
      if (url.hash) return;
      scheduleScrollReset();
      window.setTimeout(scheduleScrollReset, 0);
      window.setTimeout(scheduleScrollReset, 50);
      window.setTimeout(scheduleScrollReset, 150);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
