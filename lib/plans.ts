// Plans & prices shown on /prices, editable in the admin (Prices & offers → Plans & prices).
// `example: true` marks a price that has not been confirmed by the club yet; the site shows it with a *
// and a note to confirm at reception. Replace it in the admin and untick "Example".
import type { Bi } from '@/lib/services';

export type Plan = {
  id: string;
  label: Bi;            // "1 month", "10 sessions"
  price: number;        // JD
  unit?: Bi;            // shown after the price, e.g. "per course"
  months?: number;      // length of a subscription; used for "per month" and the end date
  days?: number;        // for short passes (e.g. a 1-day pass): the end date is start + days − 1
  note?: Bi;
  example?: boolean;
  popular?: boolean;
};
export type PlanCategory = {
  id: string;
  name: Bi;
  audience: Bi;
  service?: string;     // service page slug
  includes: Bi[];
  plans: Plan[];
};

const month = (n: number): Bi => [n === 1 ? '1 month' : `${n} months`, n === 1 ? 'شهر' : n === 2 ? 'شهرين' : n <= 10 ? `${n} أشهر` : `${n} شهراً`];

export const planCategories: PlanCategory[] = [
  {
    id: 'gym-men', name: ['Men’s gym', 'جيم الرجال'], audience: ['Men · 16 years and over', 'للرجال · ١٦ سنة فما فوق'], service: 'gym',
    includes: [['Full gym floor, 6 AM to midnight', 'كامل صالة الجيم من ٦ صباحاً حتى منتصف الليل'], ['Cardio, free weights and machines', 'كارديو وأوزان حرة وأجهزة'], ['Lockers and changing rooms', 'خزائن وغرف تبديل'], ['Free first assessment with a coach', 'تقييم أول مجاني مع مدرب']],
    plans: [
      { id: 'gym-men-1', label: month(1), price: 50, months: 1 },
      { id: 'gym-men-2', label: month(2), price: 90, months: 2 },
      { id: 'gym-men-3', label: month(3), price: 120, months: 3, popular: true },
      { id: 'gym-men-6', label: month(6), price: 210, months: 6, example: true },
      { id: 'gym-men-12', label: month(12), price: 380, months: 12, example: true },
    ],
  },
  {
    id: 'gym-ladies', name: ['Ladies’ club', 'نادي السيدات'], audience: ['Women only · separate floor', 'للسيدات فقط · طابق مستقل'], service: 'ladies',
    includes: [['Private ladies’ gym, 8 AM to 11 PM', 'جيم خاص بالسيدات من ٨ صباحاً حتى ١١ ليلاً'], ['Women’s group classes timetable', 'جدول الحصص الجماعية للسيدات'], ['Female coaches', 'مدربات'], ['Lockers and changing rooms', 'خزائن وغرف تبديل']],
    plans: [
      { id: 'ladies-1', label: month(1), price: 45, months: 1, example: true },
      { id: 'ladies-2', label: month(2), price: 80, months: 2, example: true },
      { id: 'ladies-3', label: month(3), price: 110, months: 3, popular: true, example: true },
      { id: 'ladies-6', label: month(6), price: 195, months: 6, example: true },
    ],
  },
  {
    id: 'day-pass', name: ['Day pass', 'دخول يومي'], audience: ['One day of training, no subscription', 'يوم تمرين واحد بدون اشتراك'], service: 'gym',
    includes: [['Full gym floor for the day', 'صالة الجيم كاملة لليوم'], ['Lockers and changing rooms', 'خزائن وغرف تبديل'], ['Pay by CliQ or cash at reception', 'بتدفع CliQ أو كاش بالاستقبال']],
    plans: [
      { id: 'gym-men-day', label: ['Men’s gym · 1 day', 'جيم الرجال · يوم'], price: 5, unit: ['one day', 'ليوم واحد'], days: 1, example: true },
      { id: 'ladies-day', label: ['Ladies’ club · 1 day', 'نادي السيدات · يوم'], price: 5, unit: ['one day', 'ليوم واحد'], days: 1, example: true },
    ],
  },
  {
    id: 'boxing', name: ['Boxing & martial arts', 'الملاكمة والفنون القتالية'], audience: ['Men, women and kids groups', 'مجموعات رجال وسيدات وأطفال'], service: 'martial-arts',
    includes: [['3 sessions a week with a coach', '٣ حصص أسبوعياً مع مدرب'], ['Boxing, kickboxing and self-defence', 'ملاكمة وكيك بوكسينغ ودفاع عن النفس'], ['Gloves available at the club', 'القفازات متوفرة في النادي']],
    plans: [
      { id: 'boxing-1', label: month(1), price: 50, months: 1 },
      { id: 'boxing-3', label: month(3), price: 135, months: 3, popular: true, example: true },
      { id: 'boxing-pt', label: ['Private session', 'حصة خاصة'], price: 20, unit: ['per session', 'للحصة'], example: true },
    ],
  },
  {
    id: 'group-classes', name: ['Group classes', 'الحصص الجماعية'], audience: ['Ladies’ timetable · all levels', 'جدول السيدات · لكل المستويات'], service: 'group-classes',
    includes: [['Zumba, step, core, Pilates mat and more', 'زومبا وستيب وكور وبيلاتس مات وغيرها'], ['Book your place on the Classes page', 'احجزي مكانك من صفحة الحصص']],
    plans: [
      { id: 'classes-1', label: month(1), price: 35, months: 1, example: true },
      { id: 'classes-3', label: month(3), price: 90, months: 3, popular: true, example: true },
      { id: 'classes-drop', label: ['Single class', 'حصة واحدة'], price: 5, unit: ['per class', 'للحصة'], example: true },
    ],
  },
  {
    id: 'pilates', name: ['Reformer Pilates', 'بيلاتس ريفورمر'], audience: ['Private and small-group sessions', 'حصص خاصة ومجموعات صغيرة'], service: 'pilates',
    includes: [['Reformer machines with a certified coach', 'أجهزة ريفورمر مع مدربة معتمدة'], ['Book times that suit you', 'احجزي الأوقات المناسبة لك']],
    plans: [
      { id: 'pilates-trial', label: ['Trial session', 'حصة تجريبية'], price: 15, note: ['20 JD for non-members', '٢٠ ديناراً لغير الأعضاء'] },
      { id: 'pilates-12', label: ['12 private sessions', '١٢ حصة خاصة'], price: 160, unit: ['per month', 'شهرياً'], months: 1, popular: true },
      { id: 'pilates-8', label: ['8 group sessions', '٨ حصص جماعية'], price: 80, unit: ['per month', 'شهرياً'], months: 1, example: true },
    ],
  },
  {
    id: 'pool-spa', name: ['Pool & spa', 'المسبح والسبا'], audience: ['Separate times for men and women', 'أوقات منفصلة للرجال والسيدات'], service: 'pool-spa',
    includes: [['Indoor pool, jacuzzi, sauna and steam', 'مسبح داخلي وجاكوزي وساونا وبخار'], ['Towels available', 'المناشف متوفرة']],
    plans: [
      { id: 'pool-day-member', label: ['Day entry · members', 'دخول يومي · للأعضاء'], price: 5 },
      { id: 'pool-day', label: ['Day entry · non-members', 'دخول يومي · لغير الأعضاء'], price: 10 },
      { id: 'pool-1', label: ['Pool & spa · 1 month', 'المسبح والسبا · شهر'], price: 40, months: 1, popular: true, example: true },
      { id: 'gym-pool-1', label: ['Gym + pool · 1 month', 'جيم + مسبح · شهر'], price: 75, months: 1, example: true },
    ],
  },
  {
    id: 'swimming', name: ['Swimming academy', 'أكاديمية السباحة'], audience: ['Kids and adults · all levels', 'أطفال وكبار · لكل المستويات'], service: 'swimming-academy',
    includes: [['Certified swimming coaches', 'مدربو سباحة معتمدون'], ['Small groups by level', 'مجموعات صغيرة حسب المستوى']],
    plans: [
      { id: 'swim-group', label: ['Group course · 10 sessions', 'دورة جماعية · ١٠ حصص'], price: 70, note: ['6–8 swimmers per group', '٦–٨ سبّاحين في المجموعة'], popular: true },
      { id: 'swim-private', label: ['Private · 10 sessions', 'خاص · ١٠ حصص'], price: 180 },
      { id: 'swim-therapy', label: ['Therapy swimming · 12 sessions', 'سباحة علاجية · ١٢ حصة'], price: 200 },
    ],
  },
  {
    id: 'kids', name: ['Kids', 'الأطفال'], audience: ['Ages 5 to 14', 'من ٥ إلى ١٤ سنة'], service: 'kids',
    includes: [['Kids’ swimming, martial arts and fitness', 'سباحة وفنون قتالية ولياقة للأطفال'], ['Coaches experienced with children', 'مدربون أصحاب خبرة مع الأطفال']],
    plans: [
      { id: 'kids-1', label: month(1), price: 35, months: 1, example: true },
      { id: 'kids-3', label: month(3), price: 90, months: 3, popular: true, example: true },
    ],
  },
  {
    id: 'personal-training', name: ['Personal training', 'التدريب الشخصي'], audience: ['One-to-one with a coach', 'تدريب فردي مع مدرب'], service: 'personal-training',
    includes: [['Programme built around your goal', 'برنامج مبني على هدفك'], ['Progress check every month', 'متابعة التقدم كل شهر']],
    plans: [
      { id: 'pt-1', label: ['Single session', 'حصة واحدة'], price: 20, example: true },
      { id: 'pt-12', label: ['12 sessions', '١٢ حصة'], price: 180, popular: true, example: true },
      { id: 'pt-24', label: ['24 sessions', '٢٤ حصة'], price: 320, example: true },
    ],
  },
  {
    id: 'meal-plans', name: ['Hydro Rest meal plans', 'وجبات هايدرو ريست'], audience: ['Healthy meals, daily except Friday', 'وجبات صحية يومياً عدا الجمعة'], service: 'hydro-rest',
    includes: [['Fresh meals prepared at the club', 'وجبات طازجة تُحضّر في النادي'], ['Pick up after your workout', 'استلمها بعد تمرينك']],
    plans: [
      { id: 'meal-salad', label: ['Salad plates', 'أطباق السلطة'], price: 75, unit: ['per month', 'شهرياً'], months: 1 },
      { id: 'meal-eco', label: ['Eco+ · chicken', 'Eco+ · دجاج'], price: 100, unit: ['per month', 'شهرياً'], months: 1 },
      { id: 'meal-pro', label: ['Pro+ · chicken or meat', 'Pro+ · دجاج أو لحم'], price: 110, unit: ['per month', 'شهرياً'], months: 1 },
      { id: 'meal-mix', label: ['Mix+ · chicken, meat or fish', 'Mix+ · دجاج أو لحم أو سمك'], price: 120, unit: ['per month', 'شهرياً'], months: 1, popular: true },
      { id: 'meal-hydro', label: ['Hydro+ · your choice', 'Hydro+ · على اختيارك'], price: 180, unit: ['per month', 'شهرياً'], months: 1 },
    ],
  },
];

export const findPlan = (cats: PlanCategory[], id: string) => {
  for (const c of cats) { const p = c.plans.find((x) => x.id === id); if (p) return { category: c, plan: p }; }
  return null;
};
