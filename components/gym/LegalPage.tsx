import { LAST_UPDATED, legalText, trademarkNotice, type Lang } from "@/lib/legal";

export type LegalKind = "privacy" | "terms";
const ministry = {
  en: "https://www.modee.gov.jo/EN/Pages/Services",
  ar: "https://www.modee.gov.jo/AR/Pages/%D8%A7%D9%84%D8%AE%D8%AF%D9%85%D8%A7%D8%AA",
};

export default function LegalPage({ lang, kind }: { lang: Lang; kind: LegalKind }) {
  const text = legalText[lang][kind];
  const arabic = lang === "ar";
  const prefix = arabic ? "/ar" : "";
  const updated = new Intl.DateTimeFormat(arabic ? "ar-JO" : "en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Amman" }).format(new Date(`${LAST_UPDATED}T12:00:00+03:00`));
  return <main className="legal-page" lang={lang} dir={arabic ? "rtl" : "ltr"}>
    <div className="legal-shell">
      <nav className="legal-nav" aria-label={arabic ? "التنقل" : "Navigation"}>
        <a className="legal-brand" href="/" aria-label="Hydrogen Plus Fitness">HYDROGEN<span>+</span><small>FITNESS & SPA</small></a>
        <div><a href={arabic ? `/${kind}` : `/ar/${kind}`} lang={arabic ? "en" : "ar"}>{arabic ? "English" : "العربية"}</a><a href="/">{arabic ? "العودة إلى النادي ←" : "← Back to the club"}</a></div>
      </nav>
      <header className="legal-header"><span>{arabic ? "HYDROGEN PLUS FITNESS · معلومات قانونية" : "HYDROGEN PLUS FITNESS · LEGAL"}</span><h1>{text.title}</h1><p>{arabic ? "آخر تحديث:" : "Last updated:"} <time dateTime={LAST_UPDATED}>{updated}</time></p></header>
      <article className="legal-content">
        {text.sections.map(([heading, body], index) => <section key={heading} id={`section-${index + 1}`}><h2>{heading}</h2><p>{body}</p>{kind === "privacy" && index === text.sections.length - 1 && <p><a href={ministry[lang]} target="_blank" rel="noopener noreferrer">{arabic ? "وزارة الاقتصاد الرقمي والريادة — الخدمات والشكاوى ↗" : "Ministry of Digital Economy and Entrepreneurship — Services & complaints ↗"}</a></p>}</section>)}
      </article>
      <footer className="legal-footer">
        <div><a href={`${prefix}/privacy`} aria-current={kind === "privacy" ? "page" : undefined}>{legalText[lang].privacy.title}</a><a href={`${prefix}/terms`} aria-current={kind === "terms" ? "page" : undefined}>{legalText[lang].terms.title}</a><a href="tel:+962792151000" dir="ltr">+962 7 9215 1000</a></div>
        <div><a href="https://www.instagram.com/hydrogenplusfitness/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="https://www.facebook.com/hydrogenplusfitness" target="_blank" rel="noopener noreferrer">Facebook ↗</a></div>
        <p>{trademarkNotice(lang)}</p><small>© {new Date(`${LAST_UPDATED}T12:00:00+03:00`).getFullYear()} Hydrogen Plus Fitness</small>
      </footer>
    </div>
  </main>;
}
