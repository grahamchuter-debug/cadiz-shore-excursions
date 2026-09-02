import type { ImageRole } from "@/lib/responsive-images";
import { getResponsiveSources, imageBaseFromSrc } from "@/lib/responsive-images";
import type { SiteImage } from "@/lib/images";

export interface ResponsiveImageProps {
  image: SiteImage | { src: string; alt: string; base?: string };
  role?: ImageRole;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  decorative?: boolean;
}

export function ResponsiveImage({
  image,
  role = "card",
  className,
  imgClassName,
  priority = false,
  decorative = false,
}: ResponsiveImageProps) {
  const base = image.base ?? imageBaseFromSrc(image.src);
  const sources = getResponsiveSources(base, role);

  return (
    <picture className={className}>
      {sources.srcSetAvif && (
        <source type="image/avif" srcSet={sources.srcSetAvif} sizes={sources.sizes} />
      )}
      {sources.srcSetWebp && (
        <source type="image/webp" srcSet={sources.srcSetWebp} sizes={sources.sizes} />
      )}
      <img
        src={sources.src}
        srcSet={sources.srcSetJpg || undefined}
        sizes={sources.srcSetJpg ? sources.sizes : undefined}
        alt={decorative ? "" : image.alt}
        width={sources.width}
        height={sources.height}
        className={imgClassName}
        style={"objectPosition" in image && image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        aria-hidden={decorative ? true : undefined}
      />
    </picture>
  );
}
