import type { Metadata } from "next";
import LegalPage from "@/components/gym/LegalPage";
import { legalText } from "@/lib/legal";

// Static page: the Arabic version lives at /ar/privacy. (Reading the query string made this page
// dynamic, which cannot load on the static host.)
export const metadata: Metadata = { title: `${legalText.en.privacy.title} | Hydrogen Plus Fitness`, alternates: { canonical: "/privacy", languages: { en: "/privacy", ar: "/ar/privacy" } } };
export default function Privacy() { return <LegalPage lang="en" kind="privacy" />; }
