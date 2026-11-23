'use client';
import { useMemo, useState, type ReactNode } from 'react';
import { Activity, Apple, ArrowUpRight, Clock, Droplets, Dumbbell, Flame, HeartPulse, MessageCircle, Percent, Phone, Scale } from 'lucide-react';
import { useSiteInfo } from '@/lib/admin/overrides';
import { formatClock, sessionState } from '@/lib/site-info';
import { useNow } from './SiteExtras';
import { useGymLanguage } from './SiteShell';
import './service-page.css';
import './feature-pages.css';

type Sex = 'm' | 'f';
// The club's body scan is an InBody. Its result sheet prints PBF (percent body fat), and that with the weight gives the
// fat-free mass, which calories, protein and water are worked out from. InBody's standard PBF range is 10–20% for men and
// 18–28% for women (InBody result-sheet guide); its middle, 15% and 23%, is InBody's ideal. Each row: [low below,
// standard below, high below]; above = very high. The last step (5 points over the standard range) is the page's own.
const FAT_BANDS: Record<Sex, [number, number, number]> = { m: [10, 20, 25], f: [18, 28, 33] };
const level = (v: number, b: [number, number, number]) => (v < b[0] ? 0 : v < b[1] ? 1 : v < b[2] ? 2 : 3);
const num = (v: string) => { const n = parseFloat(v.replace(',', '.')); return Number.isFinite(n) ? n : NaN; };

function Field({ label, value, onChange, unit, min, max, step = 1 }: { label: string; value: string; onChange: (v: string) => void; unit?: string; min: number; max: number; step?: number }) {
  return (
    <label className="fc-field"><span>{label}</span>
      <span className="fc-input"><input type="number" inputMode="decimal" value={value} min={min} max={max} step={step} onChange={(e) => onChange(e.target.value)} />{unit && <em>{unit}</em>}</span>
    </label>
  );
}
function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return <div className="fc-seg" role="radiogroup" aria-label={label}>{options.map(([v, l]) => <button key={v} type="button" role="radio" aria-checked={value === v} className={value === v ? 'is-on' : ''} onClick={() => onChange(v)}>{l}</button>)}</div>;
}
function Card({ icon, title, intro, children, result, id }: { icon: ReactNode; title: string; intro: string; children: ReactNode; result: ReactNode; id?: string }) {
  return <article className="fc-card" id={id}><header>{icon}<div><h3>{title}</h3><p>{intro}</p></div></header><div className="fc-body">{children}</div><div className="fc-result" aria-live="polite">{result}</div></article>;
}

export default function Calculators() {
  const { t, lang } = useGymLanguage();
  const n0 = (v: number, d = 0) => (Number.isFinite(v) ? v.toLocaleString(lang === 'ar' ? 'ar-u-nu-latn' : 'en-GB', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');
  // shared profile
  // Sex starts unset, so nobody reads numbers worked out for the wrong one. `sex` below is only used once `picked` is true.
  const [pick, setPick] = useState<Sex | ''>('');
  const picked = pick !== '';
  const sex: Sex = pick || 'f';
  const [age, setAge] = useState('28');
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('65');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState<'lose' | 'keep' | 'gain'>('keep');
  const [lift, setLift] = useState('60'); const [reps, setReps] = useState('5');
  const [neck, setNeck] = useState('33'); const [waist, setWaist] = useState(''); const [hip, setHip] = useState('96'); // waist is optional: empty until the member measures it
  const [mins, setMins] = useState('60');
  const [comp, setComp] = useState('');

  const A = num(age), H = num(height), W = num(weight);
  const bmi = W / ((H / 100) ** 2);
  const bmiBand = !Number.isFinite(bmi) ? '' : bmi < 18.5 ? t('Below the healthy range', 'أقل من المعدل الصحي') : bmi < 25 ? t('Within the healthy range', 'ضمن المعدل الصحي') : bmi < 30 ? t('Above the healthy range', 'أعلى من المعدل الصحي') : t('Well above the healthy range', 'أعلى بكثير من المعدل الصحي');
  const healthyLo = 18.5 * (H / 100) ** 2, healthyHi = 24.9 * (H / 100) ** 2;
  const whtr = num(waist) / H;
  // Optional reading from the InBody result sheet: PBF. Muscle is left out on purpose: "muscle" means a different thing on
  // every make of scale, while fat % means the same on all of them and is all the sums need (weight less fat = fat-free mass).
  const C = num(comp);
  const hasComp = picked && Number.isFinite(C) && C >= 3 && C <= 60;
  const fatPct = hasComp ? C : NaN;
  const fb = FAT_BANDS[sex];
  const compLevel = hasComp ? level(C, fb) : -1;
  const lean = W * (1 - fatPct / 100); // fat-free mass, kg
  // Skeletal muscle cannot be read off fat %: the scan measures it. It is a little over half of the fat-free mass, so the
  // page gives a band (55–59% of fat-free mass for men, 52–56% for women, as on typical InBody sheets) and calls it an
  // estimate. The member's real figure is SMM on the sheet.
  const smmShare: [number, number] = sex === 'm' ? [0.55, 0.59] : [0.52, 0.56];
  // A good weight for the height, for a gym member: an athletic build (fat-free mass index 20–22 for men, 16–18 for women)
  // at InBody's ideal body fat (15% men, 23% women). The BMI limits are wide and their lower end is the edge of underweight, and
  // the classic ideal-weight formulas describe a light, untrained build (73–79 kg for a 182 cm man), which reads as too thin.
  const h2 = (H / 100) ** 2;
  const FFMI: [number, number] = sex === 'm' ? [20, 22] : [16, 18];
  const fbMid = (fb[0] + fb[1]) / 2;
  const idealLo = (FFMI[0] * h2) / (1 - fbMid / 100), idealHi = (FFMI[1] * h2) / (1 - fbMid / 100);
  // With a PBF reading: the weight at a standard body fat on this member's own lean mass, but never on less
  // lean mass than the athletic build above. A member with little muscle is pointed at building it, not at a low weight.
  // The range starts at the member's own body fat when that is already in the leaner half of the standard range.
  const leanRef = FFMI[0] * h2;
  const buildMuscle = lean < leanRef;
  const leanGoal = Math.max(lean, leanRef);
  // Its top is 3 points above the member's own body fat, kept between InBody's ideal and the top of the standard range, so a
  // lean member is not told that a much fatter weight is a good one.
  const fitLo = leanGoal / (1 - Math.min(Math.max(fatPct, fb[0]), fbMid) / 100), fitHi = leanGoal / (1 - Math.min(Math.max(fatPct + 3, fbMid), fb[1]) / 100);
  const overBmi = bmi >= 25;
  const compVerdict = compLevel < 0 ? '' :
    [t('Body fat is below the standard range, so your weight isn’t too high. Talk to the nutritionist about gaining well.', 'نسبة الدهون أقل من المعدل، فوزنك ليس زائداً. تحدّث مع أخصائية التغذية عن زيادة صحية.'),
     overBmi ? t('Body fat is in the standard range, so your weight suits you. The extra BMI is muscle.', 'نسبة الدهون ضمن المعدل، فوزنك مناسب لك، والزيادة في المؤشر عضل.') : t('Body fat is in the standard range and your weight suits you.', 'نسبة الدهون ضمن المعدل ووزنك مناسب لك.'),
     t('Body fat is above the standard range.', 'نسبة الدهون أعلى من المعدل.'),
     t('Body fat is high. A plan with a coach and the nutritionist will help.', 'نسبة الدهون مرتفعة. ستفيدك خطة مع المدرب وأخصائية التغذية.')][compLevel];
  const compGood = compLevel === 1;
  // Resting burn: from fat-free mass (370 + 21.6 × fat-free mass, Katch–McArdle) when there is a PBF reading, otherwise Mifflin–St Jeor.
  const byComp = compLevel >= 0 && Number.isFinite(lean) && lean > 0;
  const bmr = !picked ? NaN : byComp ? 370 + 21.6 * lean : 10 * W + 6.25 * H - 5 * A + (sex === 'm' ? 5 : -161);
  const tdee = bmr * num(activity);
  const floor = sex === 'm' ? 1500 : 1200;
  const target = goal === 'lose' ? Math.max(tdee - 500, floor) : goal === 'gain' ? tdee + 300 : tdee;
  const macros = useMemo(() => {
    // Protein follows lean mass when it is known (for an average build this matches 1.6–1.8 g per kg of body weight).
    const protein = !picked ? NaN : byComp ? lean * (goal === 'keep' ? 2.1 : 2.4) : W * (goal === 'keep' ? 1.6 : 1.8); const fat = (target * 0.27) / 9; const carbs = (target - protein * 4 - fat * 9) / 4;
    return { protein, fat, carbs: Math.max(carbs, 0) };
  }, [W, goal, target, byComp, lean, picked]);
  const L = num(lift), R = Math.min(num(reps), 12);
  const oneRm = R <= 1 ? L : L * (1 + R / 30);
  const maxHr = 208 - 0.7 * A;
  const zones: [string, number, number][] = [[t('Zone 1 · easy recovery', 'المنطقة 1 · استشفاء سهل'), .5, .6], [t('Zone 2 · steady endurance', 'المنطقة 2 · تحمّل ثابت'), .6, .7], [t('Zone 3 · tempo', 'المنطقة 3 · إيقاع متوسط'), .7, .8], [t('Zone 4 · threshold', 'المنطقة 4 · العتبة'), .8, .9], [t('Zone 5 · max effort', 'المنطقة 5 · أقصى جهد'), .9, 1]];
  // Water a day: about 33 ml per kg of body weight, plus 350 ml for every 30 minutes of training. With a PBF reading it
  // follows fat-free mass instead, since lean tissue holds most of the body's water: 41 ml per kg of fat-free mass, the same
  // amount for a man at 20% body fat (as on the Galaxy Gym site).
  const water = (byComp ? lean * 0.041 : W * 0.033) + (num(mins) / 30) * 0.35;
  const N = num(neck), Wa = num(waist), Hi = num(hip);
  const bf = !picked ? NaN : sex === 'm' ? 495 / (1.0324 - 0.19077 * Math.log10(Wa - N) + 0.15456 * Math.log10(H)) - 450 : 495 / (1.29579 - 0.35004 * Math.log10(Wa + Hi - N) + 0.221 * Math.log10(H)) - 450;

  const need = <a className="fc-need" href="#your-details">{t('Choose female or male at the top to see your numbers.', 'اختر الجنس في الأعلى لتظهر أرقامك.')}</a>;

  return (
    <div className="sp">
      <section className="sv-hero">
        <div><span className="sp-kicker"><Activity size={14} />{t('YOUR FITNESS IN NUMBERS', 'لياقتك بالأرقام')}</span><h1>{t('Know your numbers.', 'اعرف أرقامك.')}</h1></div>
        <div><p>{t('Quick estimates to start a conversation with your coach or the club’s nutritionist. Enter your details once — every calculator uses them.', 'تقديرات سريعة لتبدأ بها الحديث مع مدربك أو أخصائية التغذية في النادي. أدخل بياناتك مرة واحدة وتستخدمها كل الحاسبات.')}</p></div>
      </section>
      <section className="sp-container fc-profile" id="your-details" aria-label={t('Your details', 'بياناتك')}>
        <div className={`fc-sex${picked ? '' : ' is-unset'}`}>
          {!picked && <small>{t('Choose one to start', 'اختر الجنس للبدء')}</small>}
          <Seg label={t('Sex', 'الجنس')} value={pick} onChange={setPick} options={[['f', t('Female', 'أنثى')], ['m', t('Male', 'ذكر')]]} />
        </div>
        <Field label={t('Age', 'العمر')} value={age} onChange={setAge} unit={t('yrs', 'سنة')} min={18} max={90} />
        <Field label={t('Height', 'الطول')} value={height} onChange={setHeight} unit="cm" min={120} max={230} />
        <Field label={t('Weight', 'الوزن')} value={weight} onChange={setWeight} unit="kg" min={35} max={250} step={0.5} />
      </section>
      <section className="sp-container fc-grid">
        <Card icon={<Scale size={22} />} title={t('Body mass index (BMI)', 'مؤشر كتلة الجسم')} intro={t('A quick check of your weight for your height. It can’t tell muscle from fat, so a muscular member may show as overweight — the waist check below helps.', 'مقارنة سريعة بين وزنك وطولك. لا يفرّق بين العضل والدهون، لذلك قد يظهر المتدرّب صاحب العضلات الكبيرة بوزن زائد — قياس الخصر بالأسفل يوضّح الصورة.')} result={<>
          <b>{n0(bmi, 1)}</b><span>{bmiBand}</span>
          {!picked && need}
          {picked && compLevel < 0 && Number.isFinite(idealLo) && <span>{t('A good weight for your height, with an athletic build', 'وزن مناسب لطولك ببنية رياضية')}: {t('about', 'نحو')} {n0(idealLo)}–{n0(idealHi)} {t('kg', 'كغ')}</span>}
          {Number.isFinite(healthyLo) && <span>{t('Healthy limits by BMI', 'الحدود الصحية حسب المؤشر')}: {n0(healthyLo)}–{n0(healthyHi)} {t('kg', 'كغ')}{W > healthyHi ? ` · ${t('you’re above the upper limit by', 'أنت أعلى من الحد الأعلى بـ')} ${n0(W - healthyHi)} ${t('kg', 'كغ')}` : W < healthyLo ? ` · ${t('you’re below the lower limit by', 'أنت أقل من الحد الأدنى بـ')} ${n0(healthyLo - W)} ${t('kg', 'كغ')}` : ''}</span>}
          {Number.isFinite(whtr) && <span>{t('Waist ÷ height', 'الخصر ÷ الطول')}: {n0(whtr, 2)} · {whtr < 0.5 ? t('healthy (under 0.5)', 'صحي (أقل من 0.5)') : whtr < 0.6 ? t('a little high', 'مرتفع قليلاً') : t('high', 'مرتفع')}</span>}
          {compLevel < 0 && bmi >= 25 && Number.isFinite(whtr) && whtr < 0.5 && <small>{t('Your waist is in the healthy range, so the extra weight is likely muscle.', 'خصرك ضمن المعدل الصحي، لذلك الوزن الزائد غالباً عضل.')}</small>}
          {compLevel >= 0 && <span>{t('Fat-free mass', 'الكتلة الخالية من الدهون')}: {n0(lean, 1)} {t('kg', 'كغ')} ({n0(100 - fatPct)}%) · {t('body fat', 'الدهون')}: {n0(W - lean, 1)} {t('kg', 'كغ')}</span>}
          {compLevel >= 0 && <span>{t('Skeletal muscle, estimated', 'العضلات الهيكلية (تقدير)')}: {t('about', 'نحو')} {n0((lean * smmShare[0]) / W * 100)}–{n0((lean * smmShare[1]) / W * 100)}% {t('of your weight', 'من وزنك')} ({n0(lean * smmShare[0])}–{n0(lean * smmShare[1])} {t('kg', 'كغ')})</span>}
          {compLevel >= 0 && <small>{t('The muscle figure is an estimate from your fat-free mass. Your exact figure is on the InBody sheet as SMM.', 'رقم العضلات تقدير من كتلتك الخالية من الدهون. رقمك الدقيق مكتوب على ورقة InBody باسم SMM.')}</small>}
          {compLevel >= 0 && <span>{t('InBody’s standard body fat range', 'معدل نسبة الدهون على InBody')}: {fb[0]}–{fb[1]}%</span>}
          {compLevel >= 0 && <p className={`fc-verdict ${compGood ? 'is-good' : 'is-warn'}`}>{compVerdict}</p>}
          {compLevel >= 0 && <span>{t('A good weight for you at a standard body fat', 'وزن مناسب لك بنسبة دهون ضمن المعدل')}: {t('about', 'نحو')} {n0(fitLo)}–{n0(fitHi)} {t('kg', 'كغ')}</span>}
          {compLevel >= 0 && buildMuscle && <small>{t('This range counts on building some muscle, as yours is below an athletic build for your height. Lose fat and build muscle, rather than only losing weight.', 'هذا النطاق يفترض بناء بعض العضل، لأن كتلتك العضلية أقل من البنية الرياضية لطولك. الأفضل خسارة الدهون مع بناء العضل، لا خسارة الوزن فقط.')}</small>}
        </>}>
          <div className="fc-scale" aria-hidden="true"><span className="is-low" /><span className="is-ok" /><span className="is-over" /><span className="is-high" />{Number.isFinite(bmi) && <i style={{ insetInlineStart: `${Math.min(Math.max((bmi - 15) / 20, 0), 1) * 100}%` }} />}</div>
          <div className="fc-scale-labels" aria-hidden="true"><span style={{ left: '0%' }}>{n0(15)}</span><span style={{ left: '17.5%' }}>{n0(18.5, 1)}</span><span style={{ left: '50%' }}>{n0(25)}</span><span style={{ left: '75%' }}>{n0(30)}</span><span style={{ left: '100%' }}>{n0(35)}</span></div>
          <Field label={t('Waist at the navel (optional)', 'محيط الخصر عند السرة (اختياري)')} value={waist} onChange={setWaist} unit="cm" min={50} max={200} />
          <div className="fc-comp">
            <span className="fc-comp-title">{t('Have an InBody result? (optional)', 'لديك نتيجة فحص InBody؟ (اختياري)')}</span>
            <Field label={t('Body fat, PBF', 'نسبة الدهون (PBF)')} value={comp} onChange={setComp} unit="%" min={3} max={60} step={0.1} />
            <p className="fc-hint">{t('It is on the InBody sheet as PBF (Percent Body Fat). With your weight it gives your fat-free mass, and your calories, protein and water are worked out from that. No InBody result? Estimate it with', 'تجدها على ورقة InBody باسم PBF (Percent Body Fat). منها ومن وزنك نعرف كتلتك الخالية من الدهون، وعليها تُحسب السعرات والبروتين والماء. لا تملك نتيجة فحص؟ قدّرها بـ')} <a href="#body-fat">{t('the tape-measure calculator', 'حاسبة شريط القياس')}</a>.</p>
          </div>
        </Card>
        <Card icon={<Flame size={22} />} title={t('Daily calories', 'السعرات اليومية')} intro={t('An estimate of what you burn in a day, with a target for your goal.', 'تقدير لما تحرقه في اليوم، مع هدف حسب غايتك.')} result={!picked ? need : <><b>{n0(target)} <em>kcal</em></b><span>{t('Maintenance', 'للحفاظ على الوزن')}: {n0(tdee)} · BMR {n0(bmr)}</span>
          {byComp
            ? <small>{t('Worked out from your fat-free mass', 'محسوبة من كتلتك الخالية من الدهون')} ({n0(lean, 1)} {t('kg', 'كغ')}) {t('with the Katch–McArdle formula.', 'بمعادلة Katch–McArdle.')}</small>
            : <small>{t('Worked out from weight, height and age (Mifflin–St Jeor). Add your InBody body fat (PBF) in the BMI calculator to base it on your muscle.', 'محسوبة من الوزن والطول والعمر (Mifflin–St Jeor). أدخل نسبة الدهون (PBF) من فحص InBody في حاسبة مؤشر كتلة الجسم لتُحسب حسب عضلك.')}</small>}{goal === 'lose' && target === floor && <small>{t('Capped at a safe minimum — speak with the nutritionist.', 'تم تحديده عند حد أدنى آمن — تحدّث مع أخصائية التغذية.')}</small>}</>}>
          <label className="fc-field"><span>{t('Activity', 'النشاط')}</span><select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="1.2">{t('Mostly sitting', 'جلوس معظم الوقت')}</option><option value="1.375">{t('Training 1–3 days a week', 'تمرين 1–3 أيام أسبوعياً')}</option><option value="1.55">{t('Training 3–5 days a week', 'تمرين 3–5 أيام أسبوعياً')}</option><option value="1.725">{t('Training 6–7 days a week', 'تمرين 6–7 أيام أسبوعياً')}</option>
          </select></label>
          <Seg label={t('Goal', 'الهدف')} value={goal} onChange={setGoal} options={[['lose', t('Lose fat', 'خسارة دهون')], ['keep', t('Maintain', 'محافظة')], ['gain', t('Build muscle', 'بناء عضل')]]} />
        </Card>
        <Card icon={<Dumbbell size={22} />} title={t('Macros', 'المغذيات الكبرى')} intro={t('A starting split of protein, carbs and fat for your calorie target.', 'تقسيم مبدئي للبروتين والكربوهيدرات والدهون حسب سعراتك.')} result={!picked ? need : <div className="fc-macros"><span><b>{n0(macros.protein)}g</b>{t('Protein', 'بروتين')}</span><span><b>{n0(macros.carbs)}g</b>{t('Carbs', 'كربوهيدرات')}</span><span><b>{n0(macros.fat)}g</b>{t('Fat', 'دهون')}</span></div>}>
          <p className="fc-hint">{t('Based on your daily-calorie goal. Hydro Rest’s meal plans are calorie-counted.', 'حسب هدف السعرات اليومية. وجبات هايدرو ريست محسوبة السعرات.')}{byComp && ` ${t('Protein is set by your fat-free mass.', 'البروتين محسوب حسب كتلتك الخالية من الدهون.')}`} <a className="sp-link" href="/services/hydro-rest">Hydro Rest<ArrowUpRight size={12} /></a></p>
        </Card>
        <Card icon={<Dumbbell size={22} />} title={t('One-rep max', 'أقصى تكرار واحد')} intro={t('Estimate your 1RM from a set you’ve done (Epley formula).', 'قدّر أقصى وزن لتكرار واحد من مجموعة نفذتها (معادلة Epley).')} result={<><b>{n0(oneRm, 1)} <em>kg</em></b><div className="fc-pcts">{[0.9, 0.8, 0.7, 0.6].map((p) => <span key={p}>{p * 100}% · {n0(oneRm * p, 1)}</span>)}</div></>}>
          <Field label={t('Weight lifted', 'الوزن المرفوع')} value={lift} onChange={setLift} unit="kg" min={1} max={500} step={0.5} />
          <Field label={t('Reps completed', 'عدد التكرارات')} value={reps} onChange={setReps} min={1} max={12} />
        </Card>
        <Card icon={<HeartPulse size={22} />} title={t('Heart-rate zones', 'مناطق نبض القلب')} intro={t('Estimated max heart rate (208 − 0.7 × age) and training zones.', 'تقدير أقصى نبض (208 − 0.7 × العمر) ومناطق التدريب.')} result={<><b>{n0(maxHr)} <em>bpm</em></b><ul className="fc-zones">{zones.map(([l, a, b]) => <li key={l}><span>{l}</span><b dir="ltr">{n0(maxHr * a)}–{n0(maxHr * b)}</b></li>)}</ul></>}>
          <p className="fc-hint">{t('Uses your age above. Great for cycling and cardio classes.', 'يستخدم عمرك أعلاه. مفيد لحصص الدراجات والكارديو.')}</p>
        </Card>
        <Card icon={<Droplets size={22} />} title={t('Water intake', 'شرب الماء')} intro={t('A simple daily guide, plus extra for training time.', 'دليل يومي بسيط مع كمية إضافية لوقت التمرين.')} result={<><b>{n0(water, 1)} <em>{t('litres', 'لتر')}</em></b><span>{t('About', 'حوالي')} {n0(water * 4)} {t('glasses of 250 ml', 'كوب بحجم 250 مل')}</span>{byComp && <small>{t('Worked out from your fat-free mass, as you entered your InBody body fat.', 'محسوبة من كتلتك الخالية من الدهون لأنك أدخلت نسبة الدهون من فحص InBody.')}</small>}</>}>
          <Field label={t('Training today', 'مدة التمرين اليوم')} value={mins} onChange={setMins} unit={t('min', 'دقيقة')} min={0} max={300} step={5} />
        </Card>
        <Card id="body-fat" icon={<Percent size={22} />} title={t('Body fat (tape measure)', 'نسبة الدهون (شريط القياس)')} intro={t('US Navy estimate from neck, waist and (for women) hip measurements.', 'تقدير البحرية الأمريكية من قياس الرقبة والخصر (والورك للسيدات).')} result={!picked ? need : <><b>{n0(bf, 1)}<em>%</em></b><small>{t('An estimate — a coach can measure you properly.', 'تقدير فقط — يمكن للمدرب قياسك بدقة.')}</small></>}>
          <Field label={t('Neck', 'الرقبة')} value={neck} onChange={setNeck} unit="cm" min={20} max={70} step={0.5} />
          <Field label={t('Waist (at navel)', 'الخصر (عند السرة)')} value={waist} onChange={setWaist} unit="cm" min={40} max={200} step={0.5} />
          {pick === 'f' && <Field label={t('Hips (widest point)', 'الورك (أعرض نقطة)')} value={hip} onChange={setHip} unit="cm" min={50} max={200} step={0.5} />}
        </Card>
      </section>
      <Nutritionist />
      <section className="sp-container fc-foot">
        <p>{t('These are general estimates for healthy adults, not medical advice. If you are pregnant, under 18, or managing a health condition, speak with your doctor first.', 'هذه تقديرات عامة للبالغين الأصحاء وليست نصيحة طبية. إن كنتِ حاملاً أو كان عمرك أقل من 18 عاماً أو لديك حالة صحية، استشر طبيبك أولاً.')}</p>
        <div className="sp-actions"><a className="sp-btn sp-btn-red" href="/services/personal-training">{t('Plan it with a coach', 'خطط مع مدرب')}<ArrowUpRight size={17} /></a><a className="sp-btn" href="#nutritionist">{t('Talk to the nutritionist', 'تحدث مع أخصائية التغذية')}</a><a className="sp-btn sp-btn-ghost" href="/member?tab=studio">{t('Build a workout', 'ابنِ تمرينك')}<ArrowUpRight size={15} /></a></div>
      </section>
    </div>
  );
}

// The club's nutritionist: when she is in and how to reach her (hours come from the admin-editable hours list).
function Nutritionist() {
  const { t, lang } = useGymLanguage();
  const { contact, hours } = useSiteInfo();
  const now = useNow();
  const row = hours.find((h) => h.id === 'nutrition');
  const st = row && now ? sessionState(row, now) : null;
  const phone = contact.phones[0];
  const msg = lang === 'ar' ? 'مرحباً، أودّ حجز استشارة مع أخصائية التغذية في النادي.' : 'Hello, I would like to book a consultation with the club’s nutritionist.';
  return (
    <section className="sp-container fc-nutri" id="nutritionist">
      <div className="fc-nutri-card">
        <span className="fc-nutri-icon"><Apple size={26} /></span>
        <div className="fc-nutri-text">
          <span className="fc-nutri-kicker">{t('NUTRITIONIST AT THE CLUB', 'أخصائية التغذية في النادي')}</span>
          <h2>{t('Turn these numbers into a meal plan.', 'حوّل هذه الأرقام إلى خطة غذائية.')}</h2>
          <p>{t('The club’s nutritionist is in every day. Drop by during her hours and ask at reception, or message us to book a consultation.', 'أخصائية التغذية موجودة في النادي يومياً. يمكنك زيارتها خلال ساعات عملها والسؤال عنها في الاستقبال، أو مراسلتنا لحجز استشارة.')}</p>
          {row && (
            <div className="fc-nutri-hours">
              <Clock size={17} />
              <span>{t('Daily', 'يومياً')} <b dir={lang === 'ar' ? 'rtl' : 'ltr'}>{formatClock(row.open, lang)} – {formatClock(row.close, lang)}</b></span>
              {st && <em className={st.isOpen ? 'is-open' : ''}>{st.isOpen ? t('In now', 'موجودة الآن') : t('Not in now', 'غير موجودة الآن')}</em>}
            </div>
          )}
        </div>
        <div className="fc-nutri-actions">
          <a className="sp-btn sp-btn-red" href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />{t('Message to book', 'راسلنا للحجز')}</a>
          <a className="sp-btn" href={`tel:${phone.tel}`}><Phone size={17} /><span dir="ltr">{phone.display}</span></a>
        </div>
      </div>
    </section>
  );
}
