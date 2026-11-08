import type { Metadata } from "next";
import LegalPage from "@/components/gym/LegalPage";
import { legalText } from "@/lib/legal";

export const metadata: Metadata = { title: `${legalText.ar.terms.title} | Hydrogen Plus Fitness`, alternates: { canonical: "/ar/terms", languages: { en: "/terms", ar: "/ar/terms" } } };
export default function ArabicTerms() { return <LegalPage lang="ar" kind="terms" />; }
