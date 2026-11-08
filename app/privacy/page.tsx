import type { Metadata } from "next";
import LegalPage from "@/components/gym/LegalPage";
import { legalText, type Lang } from "@/lib/legal";

type Props = { searchParams: Promise<{ lang?: string }> };
const language = (value?: string): Lang => value === "ar" ? "ar" : "en";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const lang = language((await searchParams).lang);
  return { title: `${legalText[lang].privacy.title} | Hydrogen Plus Fitness`, alternates: { canonical: lang === "ar" ? "/ar/privacy" : "/privacy", languages: { en: "/privacy", ar: "/ar/privacy" } } };
}

export default async function Privacy({ searchParams }: Props) {
  return <LegalPage lang={language((await searchParams).lang)} kind="privacy" />;
}
