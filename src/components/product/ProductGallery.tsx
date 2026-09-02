"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import type { SiteImage } from "@/lib/images";

export type ProductGalleryItem = {
  image: SiteImage;
  alt: string;
};

type ProductGalleryProps = {
  images: ProductGalleryItem[];
  productName: string;
  /** Future tour-preview clip. Hidden unless a real src is supplied. */
  video?: { src: string; poster?: string } | null;
};

const ROTATE_MS = 7000;
const FADE_MS = 700;
const RESUME_MS = 12000;

function subscribeReducedMotion(onStoreChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

export function ProductGallery({ images, productName, video }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [tab, setTab] = useState<"photos" | "video">("photos");
  const [hovering, setHovering] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const count = images.length;
  const showVideoTab = Boolean(video?.src);
  const activeTab = showVideoTab ? tab : "photos";

  const go = useCallback(
    (direction: number, fromUser = false) => {
      if (count < 2) return;
      const next = (index + direction + count) % count;
      if (next === index) return;
      setOutgoing(index);
      setIndex(next);
      if (fromUser) setPausedUntil(Date.now() + RESUME_MS);
    },
    [count, index],
  );

  useEffect(() => {
    if (outgoing == null) return;
    const timer = window.setTimeout(() => setOutgoing(null), FADE_MS);
    return () => window.clearTimeout(timer);
  }, [outgoing]);

  useEffect(() => {
    const node = regionRef.current;
    if (!node) return;

    function onKey(event: KeyboardEvent) {
      if (activeTab !== "photos" || count < 2) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1, true);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1, true);
      }
    }

    node.addEventListener("keydown", onKey);
    return () => node.removeEventListener("keydown", onKey);
  }, [activeTab, count, go]);

  useEffect(() => {
    if (reducedMotion || count < 2 || activeTab !== "photos") return;

    const tick = () => {
      if (document.hidden || hovering || Date.now() < pausedUntil) return;
      go(1, false);
    };

    const timer = window.setInterval(tick, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [reducedMotion, count, activeTab, hovering, pausedUntil, go]);

  if (count === 0 && !showVideoTab) return null;

  const showChrome = count > 1 && activeTab === "photos";
  const nextIndex = count > 1 ? (index + 1) % count : null;
  const visible = new Set<number>([index]);
  if (outgoing != null) visible.add(outgoing);
  if (nextIndex != null) visible.add(nextIndex);

  return (
    <div className="product-gallery">
      {showVideoTab && (
        <div className="mb-3 flex gap-2" role="tablist" aria-label="Product media">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "photos"}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              activeTab === "photos" ? "bg-coastal-800 text-white" : "bg-coastal-50 text-coastal-800"
            }`}
            onClick={() => setTab("photos")}
          >
            Photos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "video"}
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              activeTab === "video" ? "bg-coastal-800 text-white" : "bg-coastal-50 text-coastal-800"
            }`}
            onClick={() => setTab("video")}
          >
            Tour preview
          </button>
        </div>
      )}

      {activeTab === "video" && video?.src ? (
        <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-coastal-900">
          <video className="h-full w-full object-cover" controls poster={video.poster} preload="metadata">
            <source src={video.src} />
            Tour preview video for {productName}
          </video>
        </div>
      ) : (
        <div
          ref={regionRef}
          tabIndex={showChrome ? 0 : undefined}
          className="product-gallery-frame relative overflow-hidden rounded-2xl bg-coastal-100 outline-none focus-visible:ring-2 focus-visible:ring-coastal-500 focus-visible:ring-offset-2"
          role="region"
          aria-roledescription="carousel"
          aria-label={`Photos of ${productName}`}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current == null) return;
            const dx = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
            touchStartX.current = null;
            if (dx > 40) go(-1, true);
            if (dx < -40) go(1, true);
          }}
        >
          <div className="relative aspect-[5/4] w-full sm:aspect-[4/3] lg:aspect-[16/10]">
            {images.map((item, i) => {
              if (!visible.has(i)) return null;
              const isActive = i === index;
              const isNext = i === nextIndex && i !== index && i !== outgoing;
              return (
                <div
                  key={item.image.base}
                  className={`product-gallery-slide absolute inset-0 ${
                    isActive ? "opacity-100" : "opacity-0"
                  } ${isNext ? "pointer-events-none" : ""}`}
                  aria-hidden={!isActive}
                >
                  <ResponsiveImage
                    image={{ ...item.image, alt: item.alt }}
                    role="gallery"
                    priority={i === 0 && index === 0}
                    className="absolute inset-0 block h-full w-full"
                    imgClassName={`product-gallery-image absolute inset-0 h-full w-full object-cover ${
                      isActive && !reducedMotion ? "product-gallery-kenburns" : ""
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {showChrome && (
            <>
              <button
                type="button"
                className="product-gallery-nav left-3"
                onClick={() => go(-1, true)}
                aria-label="Previous photo"
              >
                <Chevron dir="left" />
              </button>
              <button
                type="button"
                className="product-gallery-nav right-3"
                onClick={() => go(1, true)}
                aria-label="Next photo"
              >
                <Chevron dir="right" />
              </button>
              <p className="product-gallery-count" aria-live="polite">
                <span className="sr-only">Photo </span>
                {index + 1} / {count}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      {dir === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  );
}
