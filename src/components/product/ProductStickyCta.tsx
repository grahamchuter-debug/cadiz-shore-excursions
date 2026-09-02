"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function ProductStickyCta({
  priceCompact,
  href,
  label,
  sentinelId,
}: {
  priceCompact: string | null;
  href: string;
  label: string;
  sentinelId: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById(sentinelId);
    const gallery = document.querySelector(".product-gallery-frame");
    if (!sentinel) return;

    let ctaVisible = true;
    let galleryVisible = Boolean(gallery);

    const update = () => setVisible(!ctaVisible && !galleryVisible);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === sentinel) ctaVisible = entry.isIntersecting;
          if (gallery && entry.target === gallery) galleryVisible = entry.isIntersecting;
        }
        update();
      },
      { threshold: 0.12 },
    );

    observer.observe(sentinel);
    if (gallery) observer.observe(gallery);
    return () => observer.disconnect();
  }, [sentinelId]);

  if (!visible) return null;

  return (
    <div className="product-sticky-cta lg:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {priceCompact && (
          <p className="price-amount text-base font-semibold text-coastal-900">{priceCompact}</p>
        )}
        <Link href={href} className="btn-primary flex-1 px-4 py-3 text-sm sm:flex-none">
          {label}
        </Link>
      </div>
    </div>
  );
}
