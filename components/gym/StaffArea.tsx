"use client";
import "@/lib/preview-api";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, ClipboardList, Clock3, Inbox, LoaderCircle, LockKeyhole, Mail, Phone, RefreshCw, Search, ShieldCheck } from "lucide-react";
import { trademarkNotice, type Lang } from "@/lib/legal";
import "./staff.css";

type Status = "pending" | "contacted" | "confirmed" | "cancelled";
type RequestKind = "tour" | "membership" | "class" | "training" | "contact";
type Enquiry = { id: string; reference: string; kind: RequestKind; name: string; phone: string; email?: string | null; interest?: string | null; preferredDate?: string | null; message?: string | null; status: Status; createdAt: string; consentedAt?: string };
type InboxPayload = { requests: Enquiry[]; stats: { pending: number; total: number } };
type Access = "loading" | "ready" | "signin" | "restricted" | "setup" | "error";
const statuses: Status[] = ["pending", "contacted", "confirmed", "cancelled"];
const kinds: RequestKind[] = ["tour", "membership", "class", "training", "contact"];
const words = {
 en: { staff: "STAFF WORKSPACE", title: "Every next step, in one place.", intro: "Manage the enquiries that bring people to Hydrogen Plus.", back: "Back to the club", total: "Total enquiries", pendingCount: "Awaiting follow-up", results: "Matching enquiries", allStatus: "All statuses", allKinds: "All enquiry types", search: "Search name, reference, phone or message", searchLabel: "Search enquiries", filterKind: "Filter by enquiry type", filterStatus: "Filter by status", refresh: "Refresh inbox", loading: "Opening your staff inbox…", signinTitle: "Welcome, team.", signinText: "Sign in with your approved staff account to view and manage gym enquiries.", signIn: "Continue with ChatGPT", restrictedTitle: "Staff access only.", restrictedText: "This account does not have access to the staff inbox. Contact the site owner if you need access, or sign in with your approved staff account.", setupTitle: "Staff access is not set up yet.", setupText: "Staff access has not been configured yet. The site owner must add approved staff email addresses.", errorTitle: "The inbox is temporarily unavailable.", loadError: "We couldn't load the enquiries. Please try again.", retry: "Try again", signOut: "Sign out", recent: "Recent enquiries", showing: "Showing", of: "of", loaded: "loaded enquiries", pending: "Pending", contacted: "Contacted", confirmed: "Confirmed", cancelled: "Cancelled", tour: "Club tour", membership: "Membership", class: "Class", training: "Personal training", contact: "Contact", preferred: "Preferred date", received: "Received", interest: "Interested in", message: "Message", statusLabel: "Enquiry status", save: "Save status", saving: "Saving…", saved: "Enquiry status updated.", saveError: "We couldn't update that enquiry. Please try again.", emptyTitle: "You're all caught up.", emptyText: "New gym enquiries will appear here when they are submitted.", noMatches: "No matching enquiries.", noMatchesText: "Try a different search or clear your filters.", clear: "Clear filters", noMessage: "No additional message.", email: "Email", call: "Call", privacy: "Privacy Policy", terms: "Terms & Conditions", staffNote: "Enquiry details are for authorised staff only. A status change does not automatically send a message to the visitor.", closeNotice: "Dismiss notification", sourceNote: "Search and filters apply to the loaded enquiries.", signOutSwitch: "Sign out to switch accounts", },
 ar: { staff: "مساحة فريق النادي", title: "كل الخطوات القادمة، في مكان واحد.", intro: "أدر الاستفسارات التي تقرّب الناس من Hydrogen Plus.", back: "العودة إلى النادي", total: "إجمالي الاستفسارات", pendingCount: "بانتظار المتابعة", results: "الاستفسارات المطابقة", allStatus: "جميع الحالات", allKinds: "جميع أنواع الاستفسارات", search: "ابحث بالاسم أو المرجع أو الهاتف أو الرسالة", searchLabel: "البحث في الاستفسارات", filterKind: "تصفية حسب نوع الاستفسار", filterStatus: "تصفية حسب الحالة", refresh: "تحديث الوارد", loading: "جارٍ فتح صندوق وارد الفريق…", signinTitle: "مرحباً بفريق النادي.", signinText: "سجّل الدخول بحساب الموظف المعتمد لعرض استفسارات النادي وإدارتها.", signIn: "المتابعة باستخدام ChatGPT", restrictedTitle: "الدخول للموظفين فقط.", restrictedText: "هذا الحساب غير مخوّل بالدخول إلى صندوق وارد الفريق. تواصل مع مالك الموقع لطلب الوصول أو سجّل الدخول بحساب الموظف المعتمد.", setupTitle: "لم يُعَدّ وصول الموظفين بعد.", setupText: "لم يُعَدّ وصول الموظفين بعد. يجب على مالك الموقع إضافة عناوين البريد الإلكتروني للموظفين المعتمدين.", errorTitle: "صندوق الوارد غير متاح مؤقتاً.", loadError: "تعذّر تحميل الاستفسارات. يُرجى المحاولة مرة أخرى.", retry: "إعادة المحاولة", signOut: "تسجيل الخروج", recent: "آخر الاستفسارات", showing: "عرض", of: "من", loaded: "استفسار محمّل", pending: "قيد الانتظار", contacted: "تم التواصل", confirmed: "مؤكد", cancelled: "ملغى", tour: "زيارة النادي", membership: "اشتراك", class: "حصة", training: "تدريب شخصي", contact: "تواصل", preferred: "التاريخ المفضّل", received: "تاريخ الاستلام", interest: "الخدمة المطلوبة", message: "الرسالة", statusLabel: "حالة الاستفسار", save: "حفظ الحالة", saving: "جارٍ الحفظ…", saved: "تم تحديث حالة الاستفسار.", saveError: "تعذّر تحديث الاستفسار. يُرجى المحاولة مرة أخرى.", emptyTitle: "كل شيء محدث.", emptyText: "ستظهر استفسارات النادي الجديدة هنا عند إرسالها.", noMatches: "لا توجد استفسارات مطابقة.", noMatchesText: "جرّب بحثاً آخر أو امسح عوامل التصفية.", clear: "مسح عوامل التصفية", noMessage: "لا توجد رسالة إضافية.", email: "البريد الإلكتروني", call: "اتصال", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", staffNote: "تفاصيل الاستفسارات للموظفين المخوّلين فقط. لا يرسل تغيير الحالة رسالة تلقائية إلى الزائر.", closeNotice: "إغلاق الإشعار", sourceNote: "يطبّق البحث والتصفية على الاستفسارات المحمّلة.", signOutSwitch: "تسجيل الخروج لتبديل الحساب", },
};

export default function StaffArea() {
 const [lang, setLang] = useState<Lang>("en");
 const [access, setAccess] = useState<Access>("loading");
 const [data, setData] = useState<InboxPayload | null>(null);
 const [query, setQuery] = useState("");
 const [kind, setKind] = useState("all");
 const [status, setStatus] = useState("all");
 const [drafts, setDrafts] = useState<Record<string, Status>>({});
 const [busy, setBusy] = useState<string | null>(null);
 const [refreshing, setRefreshing] = useState(false);
 const [notice, setNotice] = useState("");
 const [error, setError] = useState("");
 const t = words[lang];

 useEffect(() => { try { if (localStorage.getItem("hp-language") === "ar") setLang("ar"); } catch { /* The inbox also works without browser storage. */ } }, []);
 const load = useCallback(async (initial = true) => {
  if (initial) setAccess("loading");
  setRefreshing(true); setError("");
  try {
   const response = await fetch("/api/staff", { cache: "no-store" });
   if (response.status === 401) { setData(null); setAccess("signin"); return; }
   if (response.status === 403) { const payload = await response.json() as { error?: string }; setData(null); setAccess(payload.error === "setup-required" ? "setup" : "restricted"); return; }
   if (!response.ok) throw new Error("load-failed");
   const payload = await response.json() as InboxPayload;
   setData(payload); setAccess("ready");
  } catch { if (initial) setAccess("error"); else setError("load"); } finally { setRefreshing(false); }
 }, []);
 useEffect(() => { void load(); }, [load]);

 function changeLanguage() { const next = lang === "en" ? "ar" : "en"; setLang(next); try { localStorage.setItem("hp-language", next); } catch { /* Language remains usable for this visit. */ } }
 const filtered = useMemo(() => {
  const search = query.trim().toLocaleLowerCase();
  return (data?.requests ?? []).filter((r) => (kind === "all" || r.kind === kind) && (status === "all" || r.status === status) && (!search || [r.name, r.phone, r.email, r.reference, r.interest, r.message].filter(Boolean).join(" ").toLocaleLowerCase().includes(search)));
 }, [data, query, kind, status]);
 const dateLabel = (date: string, includeTime = false) => {
  const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00+03:00` : date);
  return Number.isNaN(parsed.getTime()) ? date : new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : "en-GB", { timeZone: "Asia/Amman", day: "numeric", month: "short", year: "numeric", ...(includeTime ? { hour: "2-digit", minute: "2-digit" } as const : {}) }).format(parsed);
 };
 function clearFilters() { setQuery(""); setKind("all"); setStatus("all"); }
 async function updateStatus(request: Enquiry) {
  const nextStatus = drafts[request.id];
  if (!nextStatus || nextStatus === request.status) return;
  setBusy(request.id); setError(""); setNotice("");
  try {
   const response = await fetch("/api/staff", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: request.id, status: nextStatus }) });
   if (response.status === 401 || response.status === 403) { await load(); return; }
   if (!response.ok) throw new Error("save-failed");
   const payload = await response.json() as { request: Enquiry };
   setData((previous) => previous ? { ...previous, requests: previous.requests.map((r) => r.id === request.id ? payload.request : r), stats: { ...previous.stats, pending: previous.stats.pending + (request.status !== "pending" && nextStatus === "pending" ? 1 : request.status === "pending" && nextStatus !== "pending" ? -1 : 0) } } : previous);
   setDrafts((previous) => { const next = { ...previous }; delete next[request.id]; return next; });
   setNotice("saved");
  } catch { setError("save"); } finally { setBusy(null); }
 }

 return <main className="staff-page" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
  <div className="staff-shell">
   <nav className="staff-nav" aria-label={lang === "ar" ? "التنقل" : "Navigation"}><a className="staff-brand" href="/"><img src="/images/logo.jpg" alt="Hydrogen Plus Fitness" width="47" height="47" /><span>HYDROGEN<span>+</span><small>FITNESS & SPA</small></span></a><div><button type="button" onClick={changeLanguage} lang={lang === "en" ? "ar" : "en"}>{lang === "en" ? "العربية" : "English"}</button><a className="staff-home" href="/"><ArrowLeft size={15} />{t.back}</a></div></nav>
   <header className="staff-header"><div><span className="staff-eyebrow"><ShieldCheck size={13} />{t.staff}</span><h1>{t.title}</h1><p>{t.intro}</p></div>{access === "ready" && <button type="button" className="staff-refresh" onClick={() => void load(false)} disabled={refreshing || busy !== null}><RefreshCw size={15} className={refreshing ? "staff-spin" : ""} />{t.refresh}</button>}</header>
   {access === "loading" ? <div className="staff-access staff-loading"><LoaderCircle size={27} className="staff-spin" /><p>{t.loading}</p></div> : access !== "ready" ? <section className="staff-access"><span className="staff-access-icon">{access === "error" ? <Inbox size={29} /> : <LockKeyhole size={29} />}</span><h2>{access === "signin" ? t.signinTitle : access === "setup" ? t.setupTitle : access === "restricted" ? t.restrictedTitle : t.errorTitle}</h2><p>{access === "signin" ? t.signinText : access === "setup" ? t.setupText : access === "restricted" ? t.restrictedText : t.loadError}</p>{access === "signin" ? <a className="staff-button" href="/signin-with-chatgpt?return_to=%2Fstaff" target="_top">{t.signIn}<ArrowUpRight size={16} /></a> : access === "error" ? <button type="button" className="staff-button" onClick={() => void load()}>{t.retry}</button> : <><button className="staff-button" type="button" onClick={() => void load()}><RefreshCw size={15} />{t.retry}</button>{access === "restricted" && <a className="staff-switch" href="/signout-with-chatgpt?return_to=%2Fstaff" target="_top">{t.signOutSwitch}</a>}</>}</section> : data && <>
    <section className="staff-stats" aria-label={lang === "ar" ? "إحصاءات الاستفسارات" : "Enquiry statistics"}><article><span><ClipboardList size={20} />{t.total}</span><strong>{data.stats.total}</strong></article><article><span><Clock3 size={20} />{t.pendingCount}</span><strong>{data.stats.pending}<i /></strong></article><article><span><Search size={20} />{t.results}</span><strong>{filtered.length}</strong></article></section>
    <section className="staff-inbox"><div className="staff-inbox-title"><h2>{t.recent}</h2><a href="/signout-with-chatgpt?return_to=%2Fstaff" target="_top">{t.signOut}</a></div>
     <div className="staff-filters"><label className="staff-search"><Search size={17} /><input type="search" aria-label={t.searchLabel} placeholder={t.search} value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="staff-select"><span className="staff-sr-only">{t.filterKind}</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">{t.allKinds}</option>{kinds.map((value) => <option key={value} value={value}>{t[value]}</option>)}</select></label><label className="staff-select"><span className="staff-sr-only">{t.filterStatus}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{t.allStatus}</option>{statuses.map((value) => <option key={value} value={value}>{t[value]}</option>)}</select></label></div>
     <div className="staff-results"><span>{t.showing} {filtered.length} {t.of} {data.requests.length} {t.loaded}</span>{(query || kind !== "all" || status !== "all") && <button type="button" onClick={clearFilters}>{t.clear}</button>}</div>
     {error && <p role="alert" className="staff-feedback staff-error">{error === "save" ? t.saveError : t.loadError}</p>}{notice && <p role="status" className="staff-feedback"><Check size={16} />{t.saved}<button type="button" aria-label={t.closeNotice} onClick={() => setNotice("")}>×</button></p>}
     {filtered.length ? <div className="staff-cards">{filtered.map((r) => <article className="staff-enquiry" key={r.id}><header><div><span className="staff-kind">{t[r.kind] || r.kind}</span><h3>{r.name}</h3><span className="staff-reference">{r.reference}</span></div><span className={`staff-status staff-status-${r.status}`}>{t[r.status] || r.status}</span></header><div className="staff-contact"><a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`}><Phone size={14} /><span dir="ltr">{r.phone}</span></a>{r.email && <a href={`mailto:${r.email}`}><Mail size={14} /><span dir="ltr">{r.email}</span></a>}</div><dl className="staff-details">{r.interest && <div><dt>{t.interest}</dt><dd>{r.interest}</dd></div>}{r.preferredDate && <div><dt>{t.preferred}</dt><dd><CalendarDays size={12} />{dateLabel(r.preferredDate)}</dd></div>}<div><dt>{t.received}</dt><dd>{dateLabel(r.createdAt, true)}</dd></div></dl><div className="staff-message"><span>{t.message}</span><p className={!r.message ? "staff-muted" : ""}>{r.message || t.noMessage}</p></div><footer><label className="staff-status-field"><span>{t.statusLabel}</span><select aria-label={`${t.statusLabel}: ${r.name}`} value={drafts[r.id] ?? r.status} onChange={(event) => setDrafts((previous) => ({ ...previous, [r.id]: event.target.value as Status }))} disabled={busy !== null}>{statuses.map((value) => <option key={value} value={value}>{t[value]}</option>)}</select></label><button className="staff-button" type="button" disabled={busy !== null || !drafts[r.id] || drafts[r.id] === r.status} onClick={() => void updateStatus(r)}>{busy === r.id ? <LoaderCircle size={15} className="staff-spin" /> : <Check size={15} />}{busy === r.id ? t.saving : t.save}</button></footer></article>)}</div> : <div className="staff-empty"><Inbox size={32} /><h3>{data.requests.length ? t.noMatches : t.emptyTitle}</h3><p>{data.requests.length ? t.noMatchesText : t.emptyText}</p>{data.requests.length > 0 && <button type="button" className="staff-button" onClick={clearFilters}>{t.clear}</button>}</div>}
     <p className="staff-source-note">{t.sourceNote}</p>
    </section><p className="staff-privacy-note"><ShieldCheck size={15} />{t.staffNote}</p>
   </>}
   <footer className="staff-footer"><div><a href={lang === "ar" ? "/ar/privacy" : "/privacy"}>{t.privacy}</a><a href={lang === "ar" ? "/ar/terms" : "/terms"}>{t.terms}</a><a href="tel:+962792151000" dir="ltr">+962 7 9215 1000</a></div><p>{trademarkNotice(lang)}</p></footer>
  </div>
 </main>;
}
