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
function Card({ icon, title, intro, children, result }: { icon: ReactNode; title: string; intro: string; children: ReactNode; result: ReactNode }) {
  return <article className="fc-card"><header>{icon}<div><h3>{title}</h3><p>{intro}</p></div></header><div className="fc-body">{children}</div><div className="fc-result" aria-live="polite">{result}</div></article>;
}

export default function Calculators() {
  const { t, lang } = useGymLanguage();
  const n0 = (v: number, d = 0) => (Number.isFinite(v) ? v.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB', { maximumFractionDigits: d, minimumFractionDigits: d }) : '—');
  // shared profile
  const [sex, setSex] = useState<Sex>('f');
  const [age, setAge] = useState('28');
  const [height, setHeight] = useState('165');
  const [weight, setWeight] = useState('65');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState<'lose' | 'keep' | 'gain'>('keep');
  const [lift, setLift] = useState('60'); const [reps, setReps] = useState('5');
  const [neck, setNeck] = useState('33'); const [waist, setWaist] = useState('72'); const [hip, setHip] = useState('96');
  const [mins, setMins] = useState('60');

  const A = num(age), H = num(height), W = num(weight);
  const bmi = W / ((H / 100) ** 2);
  const bmiBand = !Number.isFinite(bmi) ? '' : bmi < 18.5 ? t('Below the healthy range', 'أقل من المعدل الصحي') : bmi < 25 ? t('Within the healthy range', 'ضمن المعدل الصحي') : bmi < 30 ? t('Above the healthy range', 'أعلى من المعدل الصحي') : t('Well above the healthy range', 'أعلى بكثير من المعدل الصحي');
  const bmr = 10 * W + 6.25 * H - 5 * A + (sex === 'm' ? 5 : -161);
  const tdee = bmr * num(activity);
  const floor = sex === 'm' ? 1500 : 1200;
  const target = goal === 'lose' ? Math.max(tdee - 500, floor) : goal === 'gain' ? tdee + 300 : tdee;
  const macros = useMemo(() => {
    const protein = W * (goal === 'keep' ? 1.6 : 1.8); const fat = (target * 0.27) / 9; const carbs = (target - protein * 4 - fat * 9) / 4;
    return { protein, fat, carbs: Math.max(carbs, 0) };
  }, [W, goal, target]);
  const L = num(lift), R = Math.min(num(reps), 12);
  const oneRm = R <= 1 ? L : L * (1 + R / 30);
  const maxHr = 208 - 0.7 * A;
  const zones: [string, number, number][] = [[t('Zone 1 · easy recovery', 'المنطقة ١ · استشفاء سهل'), .5, .6], [t('Zone 2 · steady endurance', 'المنطقة ٢ · تحمّل ثابت'), .6, .7], [t('Zone 3 · tempo', 'المنطقة ٣ · إيقاع متوسط'), .7, .8], [t('Zone 4 · threshold', 'المنطقة ٤ · العتبة'), .8, .9], [t('Zone 5 · max effort', 'المنطقة ٥ · أقصى جهد'), .9, 1]];
  const water = W * 0.033 + (num(mins) / 30) * 0.35;
  const N = num(neck), Wa = num(waist), Hi = num(hip);
  const bf = sex === 'm' ? 495 / (1.0324 - 0.19077 * Math.log10(Wa - N) + 0.15456 * Math.log10(H)) - 450 : 495 / (1.29579 - 0.35004 * Math.log10(Wa + Hi - N) + 0.221 * Math.log10(H)) - 450;

  return (
    <div className="sp">
      <section className="sv-hero">
        <div><span className="sp-kicker"><Activity size={14} />{t('YOUR FITNESS IN NUMBERS', 'لياقتك بالأرقام')}</span><h1>{t('Know your numbers.', 'اعرف أرقامك.')}</h1></div>
        <div><p>{t('Quick estimates to start a conversation with your coach or the club’s nutritionist. Enter your details once — every calculator uses them.', 'تقديرات سريعة لتبدأ بها الحديث مع مدربك أو أخصائية التغذية في النادي. أدخل بياناتك مرة واحدة وتستخدمها كل الحاسبات.')}</p></div>
      </section>
      <section className="sp-container fc-profile" aria-label={t('Your details', 'بياناتك')}>
        <Seg label={t('Sex', 'الجنس')} value={sex} onChange={setSex} options={[['f', t('Female', 'أنثى')], ['m', t('Male', 'ذكر')]]} />
        <Field label={t('Age', 'العمر')} value={age} onChange={setAge} unit={t('yrs', 'سنة')} min={18} max={90} />
        <Field label={t('Height', 'الطول')} value={height} onChange={setHeight} unit="cm" min={120} max={230} />
        <Field label={t('Weight', 'الوزن')} value={weight} onChange={setWeight} unit="kg" min={35} max={250} step={0.5} />
      </section>
      <section className="sp-container fc-grid">
        <Card icon={<Scale size={22} />} title={t('Body mass index (BMI)', 'مؤشر كتلة الجسم')} intro={t('Weight relative to height. It doesn’t tell muscle from fat.', 'الوزن مقارنة بالطول، ولا يميّز بين العضل والدهون.')} result={<><b>{n0(bmi, 1)}</b><span>{bmiBand}</span><small>{t('Healthy adult range: 18.5–24.9', 'المعدل الصحي للبالغين: ١٨٫٥–٢٤٫٩')}</small></>}>
          <p className="fc-hint">{t('Uses your height and weight above.', 'يستخدم طولك ووزنك أعلاه.')}</p>
        </Card>
        <Card icon={<Flame size={22} />} title={t('Daily calories', 'السعرات اليومية')} intro={t('Mifflin–St Jeor estimate of what you burn, with a target for your goal.', 'تقدير معادلة Mifflin–St Jeor لما تحرقه، مع هدف حسب غايتك.')} result={<><b>{n0(target)} <em>kcal</em></b><span>{t('Maintenance', 'للحفاظ على الوزن')}: {n0(tdee)} · BMR {n0(bmr)}</span>{goal === 'lose' && target === floor && <small>{t('Capped at a safe minimum — speak with the nutritionist.', 'تم تحديده عند حد أدنى آمن — تحدّث مع أخصائية التغذية.')}</small>}</>}>
          <label className="fc-field"><span>{t('Activity', 'النشاط')}</span><select value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="1.2">{t('Mostly sitting', 'جلوس معظم الوقت')}</option><option value="1.375">{t('Training 1–3 days a week', 'تمرين ١–٣ أيام أسبوعياً')}</option><option value="1.55">{t('Training 3–5 days a week', 'تمرين ٣–٥ أيام أسبوعياً')}</option><option value="1.725">{t('Training 6–7 days a week', 'تمرين ٦–٧ أيام أسبوعياً')}</option>
          </select></label>
          <Seg label={t('Goal', 'الهدف')} value={goal} onChange={setGoal} options={[['lose', t('Lose fat', 'خسارة دهون')], ['keep', t('Maintain', 'محافظة')], ['gain', t('Build muscle', 'بناء عضل')]]} />
        </Card>
        <Card icon={<Dumbbell size={22} />} title={t('Macros', 'المغذيات الكبرى')} intro={t('A starting split of protein, carbs and fat for your calorie target.', 'تقسيم مبدئي للبروتين والكربوهيدرات والدهون حسب سعراتك.')} result={<div className="fc-macros"><span><b>{n0(macros.protein)}g</b>{t('Protein', 'بروتين')}</span><span><b>{n0(macros.carbs)}g</b>{t('Carbs', 'كربوهيدرات')}</span><span><b>{n0(macros.fat)}g</b>{t('Fat', 'دهون')}</span></div>}>
          <p className="fc-hint">{t('Based on your daily-calorie goal. Hydro Rest’s meal plans are calorie-counted.', 'حسب هدف السعرات اليومية. وجبات هايدرو ريست محسوبة السعرات.')} <a className="sp-link" href="/services/hydro-rest">Hydro Rest<ArrowUpRight size={12} /></a></p>
        </Card>
        <Card icon={<Dumbbell size={22} />} title={t('One-rep max', 'أقصى تكرار واحد')} intro={t('Estimate your 1RM from a set you’ve done (Epley formula).', 'قدّر أقصى وزن لتكرار واحد من مجموعة نفذتها (معادلة Epley).')} result={<><b>{n0(oneRm, 1)} <em>kg</em></b><div className="fc-pcts">{[0.9, 0.8, 0.7, 0.6].map((p) => <span key={p}>{p * 100}% · {n0(oneRm * p, 1)}</span>)}</div></>}>
          <Field label={t('Weight lifted', 'الوزن المرفوع')} value={lift} onChange={setLift} unit="kg" min={1} max={500} step={0.5} />
          <Field label={t('Reps completed', 'عدد التكرارات')} value={reps} onChange={setReps} min={1} max={12} />
        </Card>
        <Card icon={<HeartPulse size={22} />} title={t('Heart-rate zones', 'مناطق نبض القلب')} intro={t('Estimated max heart rate (208 − 0.7 × age) and training zones.', 'تقدير أقصى نبض (٢٠٨ − ٠٫٧ × العمر) ومناطق التدريب.')} result={<><b>{n0(maxHr)} <em>bpm</em></b><ul className="fc-zones">{zones.map(([l, a, b]) => <li key={l}><span>{l}</span><b dir="ltr">{n0(maxHr * a)}–{n0(maxHr * b)}</b></li>)}</ul></>}>
          <p className="fc-hint">{t('Uses your age above. Great for cycling and cardio classes.', 'يستخدم عمرك أعلاه. مفيد لحصص الدراجات والكارديو.')}</p>
        </Card>
        <Card icon={<Droplets size={22} />} title={t('Water intake', 'شرب الماء')} intro={t('A simple daily guide, plus extra for training time.', 'دليل يومي بسيط مع كمية إضافية لوقت التمرين.')} result={<><b>{n0(water, 1)} <em>{t('litres', 'لتر')}</em></b><span>{t('About', 'حوالي')} {n0(water * 4)} {t('glasses of 250 ml', 'كوب بحجم ٢٥٠ مل')}</span></>}>
          <Field label={t('Training today', 'مدة التمرين اليوم')} value={mins} onChange={setMins} unit={t('min', 'دقيقة')} min={0} max={300} step={5} />
        </Card>
        <Card icon={<Percent size={22} />} title={t('Body fat (tape measure)', 'نسبة الدهون (شريط القياس)')} intro={t('US Navy estimate from neck, waist and (for women) hip measurements.', 'تقدير البحرية الأمريكية من قياس الرقبة والخصر (والورك للسيدات).')} result={<><b>{n0(bf, 1)}<em>%</em></b><small>{t('An estimate — a coach can measure you properly.', 'تقدير فقط — يمكن للمدرب قياسك بدقة.')}</small></>}>
          <Field label={t('Neck', 'الرقبة')} value={neck} onChange={setNeck} unit="cm" min={20} max={70} step={0.5} />
          <Field label={t('Waist (at navel)', 'الخصر (عند السرة)')} value={waist} onChange={setWaist} unit="cm" min={40} max={200} step={0.5} />
          {sex === 'f' && <Field label={t('Hips (widest point)', 'الورك (أعرض نقطة)')} value={hip} onChange={setHip} unit="cm" min={50} max={200} step={0.5} />}
        </Card>
      </section>
      <Nutritionist />
      <section className="sp-container fc-foot">
        <p>{t('These are general estimates for healthy adults, not medical advice. If you are pregnant, under 18, or managing a health condition, speak with your doctor first.', 'هذه تقديرات عامة للبالغين الأصحاء وليست نصيحة طبية. إن كنتِ حاملاً أو كان عمرك أقل من ١٨ عاماً أو لديك حالة صحية، استشر طبيبك أولاً.')}</p>
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
