import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/schema";

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1">
            {index > 0 && <span className="text-gray-300" aria-hidden="true">/</span>}
            {index === items.length - 1 ? (
              <span className="font-medium text-coastal-700" aria-current="page">{item.name}</span>
            ) : (
              <Link href={item.path} className="hover:text-coastal-700 transition-colors">{item.name}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
