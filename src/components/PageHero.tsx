import { siteImages } from "@/lib/images";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  compact?: boolean;
  imageSrc?: string;
  imageAlt?: string;
}

export function PageHero({
  title,
  subtitle,
  children,
  compact,
  imageSrc = siteImages.hero.src,
  imageAlt = siteImages.hero.alt,
}: PageHeroProps) {
  return (
    <section
      className={`relative overflow-hidden text-white ${compact ? "py-14 sm:py-16" : "py-20 sm:py-28"}`}
    >
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="container-wide relative z-10 px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl max-w-3xl">
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
