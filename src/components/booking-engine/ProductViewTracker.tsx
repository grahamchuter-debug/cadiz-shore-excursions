"use client";

import { useEffect } from "react";
import { trackBookingEvent } from "@/platform/booking/analytics";

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackBookingEvent("product_view", { productId });
  }, [productId]);
  return null;
}
