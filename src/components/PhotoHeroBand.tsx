import type { SiteImage } from "@/lib/images";

interface PhotoHeroBandProps {
  image: SiteImage;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  compact?: boolean;
  children?: React.ReactNode;
  overlayClassName?: string;
}

export function PhotoHeroBand({
  image,
  title,
  subtitle,
  eyebrow,
  compact,
  children,
  overlayClassName = "hero-overlay",
}: PhotoHeroBandProps) {
  return (
    <section
      className={`relative overflow-hidden text-white ${compact ? "py-14 sm:py-16" : "py-20 sm:py-28"}`}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className={`absolute inset-0 ${overlayClassName}`} aria-hidden="true" />
      <div className="container-wide relative z-10 px-4 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-sm font-medium tracking-wide text-coastal-100">{eyebrow}</p>
        )}
        <h1
          className={`font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl max-w-3xl ${eyebrow ? "mt-2" : ""}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
