import { SITE } from "@/lib/site";

export function getPublicContact() {
  return {
    email: SITE.email,
    siteName: SITE.name,
  };
}
