'use client';
// Plan finder: three quick questions, then the site itself suggests a real plan with its price
// (from the same plans list as /prices) and lets you choose it right away.
import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Check, Dumbbell, HeartPulse, Salad, Shield, Sparkles, Target, UserRound, Users, Waves } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { usePlans } from '@/lib/admin/overrides';
import type { Plan, PlanCategory } from '@/lib/plans';
import { ChooseDialog, type Choice } from './Plans';
import './experiences.css';
import './plans.css';

type Side = 'men' | 'women';
type Act = 'gym' | 'classes' | 'boxing' | 'pilates' | 'swimming' | 'coach' | 'nutrition';
const ACTS: [Act, string, string, string, string, typeof Dumbbell][] = [
  ['gym', 'Gym floor', 'صالة الجيم', 'Weights, machines and cardio', 'أوزان وأجهزة وكارديو', Dumbbell],
  ['classes', 'Group classes', 'الحصص الجماعية', 'Train with a group and a coach', 'تمرّن مع مجموعة ومدرب', Users],
  ['boxing', 'Boxing & martial arts', 'الملاكمة والفنون القتالية', 'Technique, fitness and confidence', 'تقنية ولياقة وثقة', Shield],
  ['pilates', 'Pilates', 'البيلاتس', 'Reformer sessions for strength and posture', 'جلسات ريفورمر للقوة والقوام', HeartPulse],
  ['swimming', 'Swimming', 'السباحة', 'Lessons in the club pool', 'دروس في مسبح النادي', Waves],
  ['coach', 'Personal trainer', 'مدرب شخصي', 'One-to-one sessions with a plan', 'جلسات فردية مع خطة', Target],
  ['nutrition', 'Meal plan', 'خطة غذائية', 'Healthy meals from Hydro Rest', 'وجبات صحية من هايدرو ريست', Salad],
];
const CAT_OF: Record<Exclude<Act, 'gym'>, string> = { classes: 'group-classes', boxing: 'boxing', pilates: 'pilates', swimming: 'swimming', coach: 'personal-training', nutrition: 'meal-plans' };
const LENGTHS: [number, string, string, string, string][] = [
  [1, '1 month', 'شهر واحد', 'Try it first', 'للتجربة أولاً'],
  [3, '3 months', '٣ أشهر', 'Best balance of price and commitment', 'أفضل توازن بين السعر والالتزام'],
  [6, '6 months', '٦ أشهر', 'Save more', 'توفير أكبر'],
  [12, '12 months', '١٢ شهراً', 'Lowest price per month', 'أقل سعر شهرياً'],
];

const fmt = (n: number, lang: 'en' | 'ar') => (lang === 'ar' ? `${Math.round(n).toLocaleString('ar-JO')} د.أ` : `${Math.round(n).toLocaleString('en-US')} JD`);
// Best plan in a category for the chosen length: same months if there is one, else the closest shorter, else the first.
function pickPlan(cat: PlanCategory, months: number): Plan {
  const monthly = cat.plans.filter((p) => p.months && !p.unit);
  const exact = monthly.find((p) => p.months === months);
  if (exact) return exact;
  const shorter = monthly.filter((p) => (p.months ?? 0) <= months).sort((a, b) => (b.months ?? 0) - (a.months ?? 0))[0];
  return shorter ?? monthly[0] ?? cat.plans[0];
}

export default function MembershipAdvisor() {
  const { t, lang } = useGymLanguage();
  const cats = usePlans();
  const [step, setStep] = useState(0);
  const [side, setSide] = useState<Side | ''>('');
  const [acts, setActs] = useState<Act[]>(['gym']);
  const [months, setMonths] = useState(3);
  const [choice, setChoice] = useState<Choice | null>(null);
  const L = (b: [string, string]) => t(b[0], b[1]);

  const canNext = step === 0 ? !!side : step === 1 ? acts.length > 0 : true;
  const toggle = (a: Act) => setActs((x) => (x.includes(a) ? x.filter((y) => y !== a) : [...x, a]));

  // Build the suggestion from the live plans list.
  const gymCat = cats.find((c) => c.id === (side === 'women' ? 'gym-ladies' : 'gym-men'));
  const picks: { cat: PlanCategory; plan: Plan }[] = [];
  if (acts.includes('gym') && gymCat) picks.push({ cat: gymCat, plan: pickPlan(gymCat, months) });
  for (const a of acts) {
    if (a === 'gym') continue;
    const cat = cats.find((c) => c.id === CAT_OF[a]);
    if (cat) picks.push({ cat, plan: pickPlan(cat, months) });
  }
  const main = picks[0];
  const extras = picks.slice(1);
  const monthlyOf = (p: Plan) => (p.months ? p.price / p.months : p.price);
  // Monthly cost of everything picked; per-session or per-day plans can't be turned into a month, so they're left out.
  const isMonthly = (p: Plan) => !!p.months || /month/i.test(p.unit?.[0] ?? '');
  const perMonth = picks.filter((x) => isMonthly(x.plan)).reduce((sum, x) => sum + monthlyOf(x.plan), 0);
  const notCounted = picks.some((x) => !isMonthly(x.plan));
  const anyExample = picks.some((x) => x.plan.example);
  const oneMonth = main ? main.cat.plans.find((p) => p.months === 1 && !p.unit) : undefined;
  const saving = main && oneMonth && main.plan.months && main.plan.months > 1 ? oneMonth.price * main.plan.months - main.plan.price : 0;

  return (
    <div className="hp3-container hp3-membership-page">
      <div className="hp3-page-head">
        <span className="hp3-kicker">{t('PLAN FINDER', 'دليل اختيار الاشتراك')}</span>
        <h1>{t('FIND YOUR', 'اعثر على')} <em>{t('PLAN.', 'اشتراكك.')}</em></h1>
        <p>{t('Answer three quick questions and we’ll suggest the plan that fits you, with its price. You can choose it straight away.', 'أجب عن ثلاثة أسئلة سريعة، وسنقترح عليك الاشتراك المناسب مع سعره، ويمكنك اختياره مباشرة.')}</p>
      </div>

      <section className="hp3-advisor">
        <div className="hp3-advisor-intro">
          <span className="hp3-kicker">{t('ABOUT ONE MINUTE', 'دقيقة واحدة تقريباً')}</span>
          <h2>{t('THE RIGHT', 'الاشتراك')} <br />{t('PLAN,', 'المناسب،')} <br /><em>{t('IN 3 STEPS.', 'بثلاث خطوات.')}</em></h2>
          <p>{t('No sign-up needed. Prices come straight from the club’s price list.', 'دون تسجيل. الأسعار مأخوذة مباشرة من قائمة أسعار النادي.')}</p>
          <div className="hp3-advisor-progress">{[0, 1, 2, 3].map((i) => <button aria-label={t(`Step ${i + 1}`, `الخطوة ${i + 1}`)} onClick={() => i < step && setStep(i)} key={i} className={i <= step ? 'is-active' : ''} />)}</div>
          <small>{String(step + 1).padStart(2, '0')} / 04</small>
        </div>
        <div className="hp3-advisor-panel">
          {step === 0 && <>
            <span className="hp3-kicker">{t('01 · YOUR CLUB', '٠١ · القسم')}</span>
            <h3>{t('Which side of the club?', 'أي قسم يناسبك؟')}</h3>
            <div className="hp3-goal-grid">
              {([['men', 'Men’s gym', 'جيم الرجال', 'The main training floor', 'صالة التدريب الرئيسية'], ['women', 'Ladies’ club', 'نادي السيدات', 'A private space for women', 'مساحة خاصة بالسيدات']] as const).map(([v, en, ar, den, dar]) => (
                <button key={v} type="button" className={side === v ? 'is-active' : ''} aria-pressed={side === v} onClick={() => { setSide(v); setStep(1); }}>
                  <UserRound size={26} /><strong>{t(en, ar)}</strong><small>{t(den, dar)}</small>{side === v && <Check size={16} />}
                </button>
              ))}
            </div>
          </>}

          {step === 1 && <>
            <span className="hp3-kicker">{t('02 · WHAT YOU WANT', '٠٢ · ما تريده')}</span>
            <h3>{t('What would you like to do?', 'ماذا تريد أن تمارس؟')}</h3>
            <p className="hp3-muted">{t('Pick one or more.', 'اختر واحداً أو أكثر.')}</p>
            <div className="hp3-goal-grid fd-acts">
              {ACTS.map(([v, en, ar, den, dar, Icon]) => (
                <button key={v} type="button" className={acts.includes(v) ? 'is-active' : ''} aria-pressed={acts.includes(v)} onClick={() => toggle(v)}>
                  <Icon size={24} /><strong>{t(en, ar)}</strong><small>{t(den, dar)}</small>{acts.includes(v) && <Check size={16} />}
                </button>
              ))}
            </div>
          </>}

          {step === 2 && <>
            <span className="hp3-kicker">{t('03 · HOW LONG', '٠٣ · المدة')}</span>
            <h3>{t('How long do you want to sign up for?', 'ما المدة التي تريد الاشتراك بها؟')}</h3>
            <div className="fd-lengths">
              {LENGTHS.map(([m, en, ar, den, dar]) => (
                <button key={m} type="button" className={months === m ? 'is-active' : ''} aria-pressed={months === m} onClick={() => { setMonths(m); setStep(3); }}>
                  <strong>{t(en, ar)}</strong><small>{t(den, dar)}</small>{m === 3 && <em>{t('Most popular', 'الأكثر طلباً')}</em>}
                </button>
              ))}
            </div>
          </>}

          {step === 3 && main && <>
            <span className="hp3-kicker">{t('04 · OUR SUGGESTION', '٠٤ · اقتراحنا لك')}</span>
            <h3>{t('This plan fits you best:', 'هذا الاشتراك هو الأنسب لك:')}</h3>
            <article className="fd-main">
              <div className="fd-main-top">
                <span className="fd-tag"><BadgeCheck size={15} />{L(main.cat.name)}</span>
                <h4>{L(main.plan.label)}</h4>
                <p className="fd-price"><b>{fmt(main.plan.price, lang)}</b>{main.plan.example && <sup>*</sup>}{main.plan.unit && <small>/ {L(main.plan.unit)}</small>}</p>
                {main.plan.months && main.plan.months > 1 && <p className="fd-sub">≈ {fmt(monthlyOf(main.plan), lang)} {t('a month', 'شهرياً')}{saving > 0 && <> · <span className="fd-save">{t('You save', 'توفّر')} {fmt(saving, lang)}</span></>}</p>}
                {main.cat.includes.length > 0 && <ul>{main.cat.includes.slice(0, 4).map((x, i) => <li key={i}><Check size={14} />{L(x)}</li>)}</ul>}
              </div>
              <button type="button" className="hp3-button hp3-red" onClick={() => setChoice(main)}>{t('Choose this plan', 'اختر هذا الاشتراك')}<ArrowUpRight size={17} /></button>
            </article>

            {extras.length > 0 && <>
              <p className="fd-extras-title">{t('Also for you:', 'وأيضاً لك:')}</p>
              <div className="fd-extras">
                {extras.map((x) => (
                  <div key={x.cat.id} className="fd-extra">
                    <div><b>{L(x.cat.name)}</b><small>{L(x.plan.label)}{x.plan.unit ? ` · ${L(x.plan.unit)}` : ''}</small></div>
                    <span className="fd-extra-price">{fmt(x.plan.price, lang)}{x.plan.example && <sup>*</sup>}</span>
                    <button type="button" onClick={() => setChoice(x)}>{t('Choose', 'اختر')}</button>
                  </div>
                ))}
              </div>
              <p className="fd-total">{t('Everything together:', 'المجموع لكل ما اخترته:')} <b>≈ {fmt(perMonth, lang)}</b> {t('a month', 'شهرياً')}{notCounted && <small> {t('(plus per-session prices)', '(إضافة إلى أسعار الجلسات)')}</small>}</p>
            </>}

            {main.cat.plans.filter((p) => p.months && !p.unit).length > 1 && (
              <div className="fd-switch"><span>{t('Other lengths:', 'مدد أخرى:')}</span>
                {main.cat.plans.filter((p) => p.months && !p.unit).map((p) => (
                  <button key={p.id} type="button" className={p.id === main.plan.id ? 'is-active' : ''} onClick={() => setMonths(p.months!)}>{L(p.label)} · {fmt(p.price, lang)}</button>
                ))}
              </div>
            )}
            {anyExample && <p className="fd-note"><sup>*</sup> {t('Example price — the team confirms the exact price when they call you.', 'سعر تقريبي — يؤكد الفريق السعر النهائي عند الاتصال بك.')}</p>}
            <a href={`/prices#${main.cat.id}`} className="hp3-text-link">{t('See all prices', 'اطّلع على كل الأسعار')}<ArrowUpRight size={15} /></a>
          </>}

          <div className="hp3-advisor-buttons">
            {step > 0 && <button type="button" className="hp3-text-link" onClick={() => setStep((v) => v - 1)}><ArrowLeft size={16} />{t('Back', 'السابق')}</button>}
            {step < 3 && <button className="hp3-button hp3-red" disabled={!canNext} onClick={() => setStep((v) => v + 1)}>{step === 2 ? t('Show my plan', 'اعرض اشتراكي') : t('Next', 'التالي')}<ArrowRight size={16} /></button>}
            {step === 3 && <button className="hp3-text-link" onClick={() => setStep(0)}><Sparkles size={15} />{t('Start again', 'ابدأ من جديد')}</button>}
          </div>
        </div>
      </section>

      <div className="hp3-membership-help">
        <p>{t('Already part of the club?', 'هل أنت عضو في النادي؟')}</p>
        <a href="/support">{t('Renewal, freeze and membership support', 'التجديد والتجميد وخدمة الأعضاء')}<ArrowUpRight size={15} /></a>
        <a href="/prices#day-pass">{t('Day pass price', 'سعر الدخول اليومي')}<ArrowUpRight size={15} /></a>
      </div>
      <ChooseDialog choice={choice} onClose={() => setChoice(null)} />
    </div>
  );
}
