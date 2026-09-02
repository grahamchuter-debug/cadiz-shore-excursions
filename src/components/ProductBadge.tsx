import type { ProductBadgeKind } from "@/data/bookable-products";

const STYLES: Record<ProductBadgeKind, string> = {
  "editors-choice": "bg-autumn-400 text-coastal-900",
  "beach-favourite": "bg-coastal-800 text-white",
  "best-value": "bg-maple-500 text-white",
  "best-overall": "bg-autumn-400 text-coastal-900",
};

export function ProductBadge({
  label,
  kind,
  overlay = false,
}: {
  label: string;
  kind: ProductBadgeKind;
  overlay?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${STYLES[kind]} ${
        overlay ? "shadow-sm" : ""
      }`}
    >
      {label}
    </span>
  );
}
