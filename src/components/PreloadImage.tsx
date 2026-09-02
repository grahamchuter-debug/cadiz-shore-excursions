import type { ImageRole } from "@/lib/responsive-images";
import { getResponsiveSources } from "@/lib/responsive-images";

interface PreloadImageProps {
  base: string;
  role?: ImageRole;
}

function preloadLink(href: string, srcSet: string, sizes: string, media: string) {
  return (
    <link
      key={media}
      rel="preload"
      as="image"
      href={href}
      imageSrcSet={srcSet}
      imageSizes={sizes}
      type="image/avif"
      media={media}
    />
  );
}

/** Renders hoisted link rel="preload" for LCP images (homepage hero). */
export function PreloadImage({ base, role = "hero" }: PreloadImageProps) {
  const sources = getResponsiveSources(base, role);
  if (!sources.srcSetAvif) return null;

  const avifParts = sources.srcSetAvif.split(", ").map((part) => {
    const [url, descriptor] = part.split(" ");
    return { url, w: parseInt(descriptor, 10) };
  });

  const mobile = avifParts.filter((p) => p.w <= 640);
  const desktop = avifParts.filter((p) => p.w > 640);

  const toSet = (parts: typeof avifParts) => parts.map((p) => `${p.url} ${p.w}w`).join(", ");

  const mobileHref = mobile[mobile.length - 1]?.url ?? sources.preloadAvif;
  const desktopHref = desktop[desktop.length - 1]?.url ?? sources.preloadAvif;

  return (
    <>
      {mobile.length > 0 &&
        preloadLink(mobileHref, toSet(mobile), sources.sizes, "(max-width: 640px)")}
      {desktop.length > 0 &&
        preloadLink(desktopHref, toSet(desktop), sources.sizes, "(min-width: 641px)")}
    </>
  );
}
