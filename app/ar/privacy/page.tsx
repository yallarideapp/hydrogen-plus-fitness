import type { Metadata } from "next";
import LegalPage from "@/components/gym/LegalPage";
import { legalText } from "@/lib/legal";

export const metadata: Metadata = { title: `${legalText.ar.privacy.title} | Hydrogen Plus Fitness`, alternates: { canonical: "/ar/privacy", languages: { en: "/privacy", ar: "/ar/privacy" } } };
export default function ArabicPrivacy() { return <LegalPage lang="ar" kind="privacy" />; }
