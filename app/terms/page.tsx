import type { Metadata } from "next";
import LegalPage from "@/components/gym/LegalPage";
import { legalText } from "@/lib/legal";

// Static page: the Arabic version lives at /ar/terms. (Reading the query string made this page
// dynamic, which cannot load on the static host.)
export const metadata: Metadata = { title: `${legalText.en.terms.title} | Hydrogen Plus Fitness`, alternates: { canonical: "/terms", languages: { en: "/terms", ar: "/ar/terms" } } };
export default function Terms() { return <LegalPage lang="en" kind="terms" />; }
