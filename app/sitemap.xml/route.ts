import { LAST_UPDATED } from "@/lib/legal";

const origin = "https://hydrogen-plus-fitness.abdullahqudah19.chatgpt.site";

export function GET() {
  const entries = ["/", "/services", ...["gym","ladies","group-classes","pilates","martial-arts","pool-spa","swimming-academy","kids","personal-training","hydro-rest","lounge","events"].map((s) => `/services/${s}`), "/offers", "/classes", "/club", "/memberships", "/training", "/coaches", "/calculators", "/contact", "/careers", "/tools", "/support", "/join", "/community", "/privacy", "/terms", "/ar/privacy", "/ar/terms"].map((path) => {
    const kind = path.endsWith("privacy") ? "privacy" : path.endsWith("terms") ? "terms" : null;
    const alternate = kind ? `<xhtml:link rel="alternate" hreflang="en" href="${origin}/${kind}"/><xhtml:link rel="alternate" hreflang="ar" href="${origin}/ar/${kind}"/>` : "";
    return `<url><loc>${origin}${path}</loc><lastmod>${LAST_UPDATED}</lastmod>${alternate}</url>`;
  }).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
