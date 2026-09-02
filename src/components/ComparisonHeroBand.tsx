import type { SiteImage } from "@/lib/images";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { PreloadImage } from "@/components/PreloadImage";

export function ComparisonHeroBand({
  image,
  title,
  subtitle,
  compact,
}: {
  image: SiteImage;
  title: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`relative overflow-hidden text-white ${compact ? "py-14 sm:py-16" : "py-20 sm:py-28"}`}
    >
      {image.base && <PreloadImage base={image.base} role="guide" />}
      <ResponsiveImage
        image={image}
        role="guide"
        priority
        className="absolute inset-0 block h-full w-full"
        imgClassName="absolute inset-0 h-full w-full object-cover"
      />
      <div className="hero-overlay absolute inset-0" aria-hidden="true" />
      <div className="container-wide relative z-10 px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-medium tracking-wide text-coastal-100">Cruise passenger comparison</p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
