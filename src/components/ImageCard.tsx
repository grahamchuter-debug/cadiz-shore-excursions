import Link from "next/link";
import type { SiteImage } from "@/lib/images";

interface ImageCardProps {
  href: string;
  image?: SiteImage;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}

export function ImageCard({
  href,
  image,
  title,
  subtitle,
  eyebrow,
  className = "card-editorial",
}: ImageCardProps) {
  return (
    <Link href={href} className={`${className} group block overflow-hidden`}>
      {image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image.src}
            alt={image.alt}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-coastal-900/60 via-transparent to-transparent"
            aria-hidden="true"
          />
        </div>
      )}
      <div className="p-5 sm:p-6">
        {eyebrow && <p className="text-xs font-medium text-coastal-600">{eyebrow}</p>}
        <h2
          className={`font-display text-lg font-bold text-gray-900 group-hover:text-coastal-800 ${eyebrow ? "mt-1" : ""}`}
        >
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-sm text-gray-600">{subtitle}</p>}
      </div>
    </Link>
  );
}
