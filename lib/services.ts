// One entry per service page. Every fact below comes from a dated post on the club's
// official Instagram (collected 8 November 2026) — prices and hours are shown with their
// publication date and marked "past" when they belonged to an earlier offer or season.
// Post lists for each page live in service-posts.json.

export type Bi = [string, string];
export type ServiceFact = { label: Bi; value: Bi; date: string; source: string; past?: boolean };
export type ServiceFaq = { q: Bi; a: Bi };
export type TimelineTag = 'offer' | 'hours' | 'news' | 'event' | 'closure' | 'opening';
export type TimelineItem = { date: string; tag: TimelineTag; title: Bi; text?: Bi; source: string; image?: string };
export type ServiceIcon = 'dumbbell' | 'sparkles' | 'users' | 'flower' | 'swords' | 'waves' | 'swim' | 'baby' | 'user' | 'salad' | 'moon' | 'calendar' | 'tag';
export type MenuItem = { name: Bi; desc?: Bi; prices: { label?: Bi; jd: string }[] };
export type MenuSection = { title: Bi; items: MenuItem[] };
export type Service = {
  slug: string; path: string; icon: ServiceIcon;
  name: Bi; kicker: Bi; headline: Bi; intro: Bi; body?: Bi[];
  hero: { src: string; width: number; height: number; alt: Bi };
  highlights: Bi[];
  facts: ServiceFact[];
  faqs: ServiceFaq[];
  timeline?: TimelineItem[];
  cta: { kind: 'tour' | 'membership' | 'class' | 'training' | 'contact'; interest: string; label: Bi };
  related: string[];
  schedule?: 'all' | string[];
  coaches?: { name: Bi; role: Bi; source: string }[];
  links?: { label: Bi; href: string; external?: boolean }[];
  featured?: string[];
  phone?: { display: string; tel: string; label: Bi };
  menu?: { note: Bi; source: string; sections: MenuSection[]; pages: string[] };
};

const p = (code: string) => `https://www.instagram.com/p/${code}/`;
const hero = (slug: string, width: number, height: number, alt: Bi) => ({ src: `/images/display/svc-${slug}.webp`, width, height, alt });

const timetableCoaches: Service['coaches'] = ['Farah|فرح', 'Sara|سارة', 'Katie|كاتي', 'Lesya|ليسيا', 'Abeer|عبير', 'Marwa|مروى', 'Svitlana|سفيتلانا'].map((n) => {
  const [en, ar] = n.split('|');
  return { name: [en, ar], role: ['Group classes (women’s timetable)', 'الحصص الجماعية (جدول السيدات)'], source: p('DfZrJukouow') };
});

export const services: Service[] = [
  {
    slug: 'gym', path: '/services/gym', icon: 'dumbbell',
    name: ['Gym floor', 'صالة الجيم'], kicker: ['STRENGTH & CARDIO', 'القوة والكارديو'],
    headline: ['The north’s biggest training floor.', 'أكبر صالة تدريب في الشمال.'],
    intro: ['Resistance machines, plate-loaded stations, free weights, a turf track and a full cardio zone under one roof — the red-and-black floor the club calls the largest gym in the north.', 'أجهزة مقاومة، محطات أوزان، أوزان حرة، مسار عشبي ومنطقة كارديو متكاملة تحت سقف واحد — الصالة الحمراء والسوداء التي يصفها النادي بأنها أكبر جيم في الشمال.'],
    body: [
      ['Men and women each have their own gym hours, and the club’s trainers are on the floor to help you set up machines and plan your sessions. Equipment spotlights on Instagram cover the vertical leg press, V-squat, Super Rowing machine, multi-rotary arm curl and dedicated back and upper-chest stations.', 'للرجال والسيدات أوقات دوام خاصة بكل منهم، ومدربو النادي متواجدون في الصالة لمساعدتك في ضبط الأجهزة وتنظيم تمارينك. يعرض النادي على إنستغرام أجهزة مثل Vertical leg press وV-squat وSuper Rowing وMulti Rotary Arms Curl وأجهزة الظهر والجزء العلوي من الصدر.'],
    ],
    hero: hero('gym', 1800, 1200, ['The Hydrogen training floor with red strength machines.', 'صالة تدريب هايدروجين بأجهزتها الحمراء.']),
    highlights: [
      ['Latest-generation strength machines', 'أحدث أجهزة القوة'], ['Free weights & plate-loaded stations', 'أوزان حرة ومحطات أوزان'], ['Cardio zone: treadmills, bikes, rowers', 'منطقة كارديو: مشايات ودراجات وأجهزة تجديف'],
      ['Functional turf track', 'مسار عشبي للتمارين الوظيفية'], ['Separate men’s and ladies’ hours', 'دوام منفصل للرجال والسيدات'], ['Trainers on the floor', 'مدربون في الصالة'],
    ],
    facts: [
      { label: ['Men’s hours', 'دوام الرجال'], value: ['6:00 AM – 12:00 midnight', '٦ صباحاً – ١٢ منتصف الليل'], date: '2026-11-08', source: 'https://www.instagram.com/hydrogenplusfitness/' },
      { label: ['Ladies’ hours', 'دوام السيدات'], value: ['8:00 AM – 11:00 PM (from 1 Aug 2026)', '٨ صباحاً – ١١ مساءً (ابتداءً من ١/٨/٢٠٢٦)'], date: '2026-07-29', source: p('DbYWJMxFVaA') },
      { label: ['Ramadan 2026 hours — men', 'دوام رمضان ٢٠٢٦ — الرجال'], value: ['12:00–6:00 PM and 8:30 PM–2:00 AM', '١٢:٠٠–٦:٠٠ م و٨:٣٠ م–٢:٠٠ ص'], date: '2026-02-19', source: p('DU8KYELCcnM'), past: true },
      { label: ['Ramadan 2026 hours — ladies', 'دوام رمضان ٢٠٢٦ — السيدات'], value: ['12:00–5:30 PM and 8:30 PM–1:00 AM', '١٢:٠٠–٥:٣٠ م و٨:٣٠ م–١:٠٠ ص'], date: '2026-02-19', source: p('DU8KYELCcnM'), past: true },
    ],
    faqs: [
      { q: ['Can I see the gym before joining?', 'هل يمكنني رؤية الجيم قبل الاشتراك؟'], a: ['Yes. Send a visit request with your preferred day and the team will call you to arrange it.', 'نعم. أرسل طلب زيارة مع اليوم المناسب لك، وسيتواصل معك الفريق لترتيبها.'] },
      { q: ['Do men and women train at the same time?', 'هل يتمرن الرجال والسيدات في الوقت نفسه؟'], a: ['The club publishes separate men’s and ladies’ hours. Ask the team which areas each session uses.', 'ينشر النادي أوقات دوام منفصلة للرجال والسيدات. اسأل الفريق عن المناطق المخصصة لكل دوام.'] },
      { q: ['How much is a membership?', 'كم سعر الاشتراك؟'], a: ['Prices change with each offer. The most recent offers are listed on News & offers — call the club for today’s price.', 'تتغير الأسعار مع كل عرض. تجد آخر العروض المنشورة في صفحة الأخبار والعروض، واتصل بالنادي لمعرفة سعر اليوم.'] },
    ],
    cta: { kind: 'tour', interest: 'Gym floor', label: ['Book a gym visit', 'اطلب زيارة للجيم'] },
    related: ['personal-training', 'group-classes', 'hydro-rest'],
    featured: ['DMnZ4_JqiH2', 'DfZnF4HoeLO', 'De14tnrIndT', 'DTLJF72AX5V', 'DTF97zACcV_', 'DSP-KGagb-2', 'DP3ixnfCmSX', 'DQo4wydiFa0', 'DQbY_nJk02v', 'DNOLKA3u_ZT'],
  },
  {
    slug: 'ladies', path: '/services/ladies', icon: 'sparkles',
    name: ['Ladies’ club', 'نادي السيدات'], kicker: ['FOR WOMEN', 'للسيدات'],
    headline: ['A space built for powerful women.', 'مساحة صُممت للمرأة القوية.'],
    intro: ['Ladies’ gym hours from 8 AM to 11 PM, a new women’s class timetable every week, women coaches, ladies’ pool hours, a women-only swimming course and martial-arts courses for women.', 'دوام للسيدات من ٨ صباحاً حتى ١١ مساءً، وجدول حصص جديد للسيدات كل أسبوع، ومدربات، وأوقات مخصصة للسيدات في المسبح، ودورة سباحة للسيدات، ودورات فنون قتالية للسيدات.'],
    body: [['Beyond training, the club hosts women-focused events — Ladies Night at Hydrogen Lounge and the HER Story breast-cancer awareness event in October 2026.', 'وإلى جانب التدريب، يستضيف النادي فعاليات خاصة بالسيدات مثل Ladies Night في هايدروجين لاونج وفعالية HER Story للتوعية بسرطان الثدي في أكتوبر ٢٠٢٦.']],
    hero: hero('ladies', 1637, 2048, ['A member training on the ladies’ gym floor.', 'متدربة في صالة السيدات.']),
    highlights: [
      ['Ladies’ gym 8 AM – 11 PM', 'جيم السيدات ٨ ص – ١١ م'], ['35 women’s classes this week', '٣٥ حصة للسيدات هذا الأسبوع'], ['Women coaches', 'مدربات متخصصات'],
      ['Ladies’ pool hours', 'أوقات مسبح للسيدات'], ['Women-only swimming course', 'دورة سباحة للسيدات'], ['Ladies’ martial arts', 'فنون قتالية للسيدات'],
    ],
    facts: [
      { label: ['Ladies’ gym hours', 'دوام جيم السيدات'], value: ['Daily 8:00 AM – 11:00 PM', 'يومياً ٨:٠٠ ص – ١١:٠٠ م'], date: '2026-07-29', source: p('DbYWJMxFVaA') },
      { label: ['Ladies’ pool hours', 'أوقات مسبح السيدات'], value: ['Daily 9:00 AM – 5:00 PM (summer season)', 'يومياً ٩:٠٠ ص – ٥:٠٠ م (الموسم الصيفي)'], date: '2026-08-06', source: p('Dbsnf4Qjt78'), past: true },
      { label: ['Women’s swimming course', 'دورة السباحة للسيدات'], value: ['Sun, Tue, Thu · 10–11 AM or 5–6 PM (with North Sharks Academy, from 5 Jul 2026)', 'الأحد والثلاثاء والخميس · ١٠–١١ ص أو ٥–٦ م (مع North Sharks، من ٥/٧/٢٠٢٦)'], date: '2026-06-27', source: p('DaGORnjI7ko'), past: true },
      { label: ['Mother’s Day offer', 'عرض عيد الأم'], value: ['3 months for 100 JD', '٣ أشهر بـ ١٠٠ دينار'], date: '2025-03-19', source: p('DHYi_5Doztv'), past: true },
    ],
    faqs: [
      { q: ['Are the classes on the timetable for women?', 'هل الحصص في الجدول مخصصة للسيدات؟'], a: ['Yes — the weekly timetable the club publishes is the women’s class schedule.', 'نعم، الجدول الأسبوعي الذي ينشره النادي هو جدول حصص السيدات.'] },
      { q: ['Are the coaches women?', 'هل المدربات سيدات؟'], a: ['The women’s classes are led by the coaches named on the timetable, and the women’s swimming course is supervised by female coaches.', 'تقدّم حصص السيدات المدربات المذكورات في الجدول، ودورة السباحة للسيدات بإشراف مدربات.'] },
      { q: ['Is the pool private for women?', 'هل المسبح مخصص للسيدات؟'], a: ['The club publishes dedicated ladies’ pool hours each season. Check the latest hours with the team before you visit.', 'ينشر النادي أوقاتاً مخصصة للسيدات في المسبح كل موسم. تأكدي من آخر الأوقات مع الفريق قبل زيارتك.'] },
    ],
    cta: { kind: 'membership', interest: 'Ladies’ club', label: ['Ask about the ladies’ club', 'استفسري عن نادي السيدات'] },
    related: ['group-classes', 'pilates', 'swimming-academy'],
    schedule: 'all',
    coaches: timetableCoaches,
    featured: ['DI1jIyKIbUa', 'DfZrJukouow', 'DTu30XxFehD', 'DfH7vdhuRhA', 'DbDntDTFYk4', 'DavPdFvAppE'],
  },
  {
    slug: 'group-classes', path: '/services/group-classes', icon: 'users',
    name: ['Group classes', 'الحصص الجماعية'], kicker: ['MOVE TOGETHER', 'تحرّكوا معاً'],
    headline: ['Find the class that fits your goal.', 'اكتشفي الحصة التي تناسب هدفك.'],
    intro: ['A new women’s timetable every week — cycling, Zumba, yoga, Tabata, step, belly dance, core and toning — plus seasonal specials such as poolside outdoor classes and aqua aerobics.', 'جدول حصص جديد للسيدات كل أسبوع — دراجات، زومبا، يوغا، تاباتا، ستيب، رقص شرقي، تمارين الجذع والشد — بالإضافة إلى حصص موسمية مثل الحصص الخارجية بجانب المسبح والأكوا إيروبيك.'],
    body: [['Whether your goal is muscle strength, toning, flexibility or burning fat, the club’s coaches point you to the right class. CrossFit courses for men and women have also been offered.', 'سواء كان هدفك تقوية العضلات أو شد الجسم أو المرونة أو حرق الدهون، ترشدك المدربات إلى الحصة المناسبة. كما قدّم النادي دورات كروس فيت للرجال والسيدات.']],
    hero: hero('group-classes', 1080, 1080, ['Women training in a Hydrogen group class.', 'سيدات في حصة جماعية في هايدروجين.']),
    highlights: [
      ['Cycling, step & aerobic', 'دراجات وستيب وإيروبيك'], ['Zumba & belly dance', 'زومبا ورقص شرقي'], ['Yoga, core & Pilates mat', 'يوغا وتمارين الجذع وبيلاتس مات'],
      ['Tabata HIIT', 'تاباتا HIIT'], ['Aqua aerobics', 'أكوا إيروبيك'], ['Outdoor poolside classes', 'حصص خارجية بجانب المسبح'],
    ],
    facts: [
      { label: ['Current timetable', 'الجدول الحالي'], value: ['Week of 7–12 November 2026 · 35 classes', 'أسبوع ٧–١٢ نوفمبر ٢٠٢٦ · ٣٥ حصة'], date: '2026-11-06', source: p('DfZrJukouow') },
      { label: ['Aqua aerobics with Coach Marwa', 'أكوا إيروبيك مع كوتش مروى'], value: ['Members only · bring swimwear · limited places, book ahead', 'للمشتركين فقط · يرجى إحضار ملابس السباحة · الأعداد محدودة والحجز مسبق'], date: '2026-11-04', source: p('DNQsXJkozGu') },
      { label: ['Outdoor poolside classes', 'الحصص الخارجية بجانب المسبح'], value: ['Kickboxing, yoga, belly dance and Zumba for female members', 'كيك بوكسينج ويوغا ورقص شرقي وزومبا لمشتركات النادي'], date: '2025-09-19', source: p('DOyYxsLjwfi'), past: true },
      { label: ['CrossFit courses', 'دورات كروس فيت'], value: ['For men and women', 'للرجال والسيدات'], date: '2026-01-26', source: p('DT-jAGZCK3C'), past: true },
    ],
    faqs: [
      { q: ['Does requesting a class reserve my place?', 'هل يضمن طلب الحصة حجز مكاني؟'], a: ['No. A class request is sent to the team, who confirm with you. Some classes, such as aqua aerobics, have limited places.', 'لا. يصل طلب الحصة إلى الفريق ليؤكدوا معك. بعض الحصص مثل الأكوا إيروبيك أعدادها محدودة.'] },
      { q: ['How long is each class?', 'كم مدة الحصة؟'], a: ['The timetable lists start times only. Ask the team about duration and level before your first class.', 'يذكر الجدول أوقات البدء فقط. اسألي الفريق عن مدة الحصة ومستواها قبل حصتك الأولى.'] },
    ],
    cta: { kind: 'class', interest: 'Group classes', label: ['Ask about a class', 'استفسري عن حصة'] },
    related: ['ladies', 'pilates', 'pool-spa'],
    schedule: 'all',
    coaches: timetableCoaches,
    links: [{ label: ['Open the full timetable', 'افتحي الجدول الكامل'], href: '/classes' }],
    featured: ['DfZrJukouow', 'DfHr0A9FaY9', 'DaxHj9ElTP0', 'DNQsXJkozGu', 'DFpq1gnsmk6', 'DOnz7xbjHTO', 'DORe7MyDC8Y'],
  },
  {
    slug: 'pilates', path: '/services/pilates', icon: 'flower',
    name: ['Reformer Pilates', 'ريفورمر بيلاتس'], kicker: ['FIRST IN IRBID', 'الأولى في إربد'],
    headline: ['Irbid’s first reformer Pilates room.', 'أول غرفة ريفورمر بيلاتس في إربد.'],
    intro: ['A dedicated, calm reformer studio with a certified coach — private sessions, prenatal Pilates and the occasional outdoor Pilates retreat.', 'غرفة ريفورمر مخصصة وهادئة مع كوتش معتمدة — حصص خاصة، وبيلاتس للحوامل، وجلسات بيلاتس خارجية بين الحين والآخر.'],
    body: [['The club’s Pilates highlight describes the room as designed for calm, energy and a safe space to move freely. Prenatal sessions focus on pelvic-floor and back strength, breathing and relaxation and easing lower-back discomfort — always check with your doctor first. In spring 2026 the studio took Pilates outdoors to the hills of Salt.', 'يصف النادي غرفة البيلاتس بأنها مصممة لتمنحك الهدوء والطاقة ومساحة آمنة للحركة بحرية. تركّز حصص الحوامل على تقوية عضلات الحوض والظهر وتحسين التنفس والاسترخاء وتخفيف آلام أسفل الظهر — استشيري طبيبك أولاً. وفي ربيع ٢٠٢٦ نقل الاستوديو جلسات البيلاتس إلى الطبيعة بين جبال السلط.']],
    hero: hero('pilates', 1080, 1920, ['The reformer Pilates room.', 'غرفة الريفورمر بيلاتس.']),
    highlights: [
      ['Dedicated reformer room', 'غرفة ريفورمر مخصصة'], ['Certified coach', 'كوتش معتمدة'], ['Private classes', 'حصص خاصة'],
      ['Prenatal Pilates', 'بيلاتس للحوامل'], ['Outdoor Pilates experiences', 'تجارب بيلاتس في الطبيعة'], ['Trial sessions', 'حصص تجريبية'],
    ],
    facts: [
      { label: ['Private reformer class', 'حصص ريفورمر خاصة'], value: ['12 sessions a month · 160 JD', '١٢ حصة شهرياً · ١٦٠ دينار'], date: '2025-08-16', source: p('DNbCr-etD9t'), past: true },
      { label: ['Trial session', 'الحصة التجريبية'], value: ['15 JD for gym members · 20 JD for non-members', '١٥ دينار لمشتركي الجيم · ٢٠ دينار لغير المشتركين'], date: '2025-08-16', source: p('DNbCr-etD9t'), past: true },
      { label: ['Outdoor Pilates', 'بيلاتس في الطبيعة'], value: ['Session in the hills of Salt', 'جلسة بين جبال السلط'], date: '2026-04-22', source: p('DXbm2lNCCy-'), past: true },
    ],
    faqs: [
      { q: ['I’ve never done reformer Pilates. Can I start?', 'لم أجرّب الريفورمر من قبل، هل يمكنني البدء؟'], a: ['Yes. Book a trial session so the coach can show you the reformer and suggest the right plan.', 'نعم. احجزي حصة تجريبية لتعرّفك الكوتش على الجهاز وتقترح الخطة المناسبة.'] },
      { q: ['Is prenatal Pilates safe for me?', 'هل بيلاتس الحوامل آمن لي؟'], a: ['Speak with your doctor before starting, then tell the coach how far along you are.', 'استشيري طبيبك قبل البدء، ثم أخبري الكوتش بمرحلة حملك.'] },
    ],
    cta: { kind: 'class', interest: 'Reformer Pilates trial', label: ['Request a Pilates trial', 'اطلبي حصة بيلاتس تجريبية'] },
    related: ['ladies', 'group-classes', 'personal-training'],
    coaches: [{ name: ['Marwa', 'مروى'], role: ['Shares the club’s Pilates and prenatal sessions', 'تشارك حصص البيلاتس وبيلاتس الحوامل في النادي'], source: 'https://www.instagram.com/stories/highlights/17947685139012669/' }],
    featured: ['DOFDqSvAIq4', 'DNbCr-etD9t', 'DXbm2lNCCy-', 'DX_miOVos9c'],
  },
  {
    slug: 'martial-arts', path: '/services/martial-arts', icon: 'swords',
    name: ['Boxing & martial arts', 'البوكسينج والفنون القتالية'], kicker: ['COMBAT HALL', 'صالة القتال'],
    headline: ['Boxing, MMA, Muay Thai and Jiu-Jitsu.', 'بوكسينج، MMA، مواي تاي وجوجيتسو.'],
    intro: ['A purpose-built combat hall — described by the club as the largest and best-equipped in the north — with courses for adults, women and children.', 'صالة قتالية مجهزة — يصفها النادي بأنها الأكبر والأفخم في الشمال — مع دورات للكبار والسيدات والأطفال.'],
    body: [['The hall has hosted black-belt exams supervised by the Jordanian Kickboxing Federation, and a training day with national boxing team member Coach Mohammad Al-Talawi and Coach Sanad Al-Talawi.', 'استضافت الصالة فحوصات الأحزمة السوداء بإشراف الاتحاد الأردني للكيك بوكسينغ، ويوماً تدريبياً مع الملاكم ولاعب المنتخب الوطني الكوتش محمد التلاوي والكوتش سند التلاوي.']],
    hero: hero('martial-arts', 1637, 2048, ['Boxing pads training in the combat hall.', 'تدريب بوكسينج في صالة القتال.']),
    highlights: [
      ['Boxing', 'بوكسينج'], ['MMA', 'MMA'], ['Muay Thai', 'مواي تاي'], ['Jiu-Jitsu', 'جوجيتسو'], ['Kickboxing', 'كيك بوكسينج'], ['Courses for kids & women', 'دورات للأطفال والسيدات'],
    ],
    facts: [
      { label: ['Martial-arts course', 'دورة الفنون القتالية'], value: ['40 JD per course · 1 month, 3 sessions a week (offer to 8 Jan 2026)', '٤٠ دينار للدورة · شهر واحد، ٣ حصص أسبوعياً (عرض حتى ٨/١/٢٠٢٦)'], date: '2025-12-30', source: p('DS4e25ijJzS'), past: true },
      { label: ['Black-belt exams', 'فحوصات الأحزمة السوداء'], value: ['Hosted with the Jordanian Kickboxing Federation', 'بإشراف الاتحاد الأردني للكيك بوكسينغ'], date: '2026-08-09', source: p('Db0nRd9N9Hx') },
      { label: ['Ladies’ courses', 'دورات السيدات'], value: ['Jiu-Jitsu, MMA, Muay Thai & boxing', 'جوجيتسو، MMA، مواي تاي وبوكسينج'], date: '2025-09-30', source: p('DPOwmObDD_m'), past: true },
    ],
    faqs: [
      { q: ['Do I need experience?', 'هل أحتاج إلى خبرة سابقة؟'], a: ['No. The courses are advertised for all ages and levels, from beginners up.', 'لا. الدورات معلنة لجميع الأعمار والمستويات، بدءاً من المبتدئين.'] },
      { q: ['What age can children join?', 'من أي عمر يمكن للأطفال الانضمام؟'], a: ['Kids’ martial-arts courses run regularly, including school-holiday courses. Ask the team which group suits your child’s age.', 'تُقام دورات الفنون القتالية للأطفال بشكل منتظم، ومنها دورات العطلة المدرسية. اسأل الفريق عن المجموعة المناسبة لعمر طفلك.'] },
    ],
    cta: { kind: 'class', interest: 'Boxing & martial arts course', label: ['Ask about a course', 'استفسر عن دورة'] },
    related: ['kids', 'personal-training', 'gym'],
    featured: ['DO_Z9saFWDf', 'DetwIuuILDo', 'DPZJNeHFTXM', 'DPhBqEHk6pq', 'DfVAy3ctiXa', 'Db0nRd9N9Hx', 'DOeDhj8iLus', 'DTalm1CjMlO'],
  },
  {
    slug: 'pool-spa', path: '/services/pool-spa', icon: 'waves',
    name: ['Pool & spa', 'المسبح والسبا'], kicker: ['ROOFTOP POOL', 'مسبح على السطح'],
    headline: ['Train, then recharge by the water.', 'تمرّن، ثم استعد طاقتك بجانب الماء.'],
    intro: ['An outdoor rooftop pool with sun loungers, umbrellas and city views, plus spa sessions for post-workout recovery. The pool opens for the summer season with set ladies’ and men’s times.', 'مسبح خارجي على السطح مع كراسي استرخاء ومظلات وإطلالة على المدينة، بالإضافة إلى جلسات السبا للاسترخاء بعد التمرين. يفتح المسبح في الموسم الصيفي بأوقات محددة للسيدات والرجال.'],
    body: [['Non-members can use the pool too, at a separate day price. Through the season the pool also hosts swimming courses, aqua aerobics, poolside outdoor classes and pool parties.', 'يمكن لغير المشتركين استخدام المسبح أيضاً بسعر دخول خاص. وخلال الموسم يستضيف المسبح دورات السباحة والأكوا إيروبيك والحصص الخارجية وحفلات المسبح.']],
    hero: hero('pool-spa', 1800, 1200, ['The rooftop pool at sunset.', 'المسبح على السطح وقت الغروب.']),
    highlights: [
      ['Outdoor rooftop pool', 'مسبح خارجي على السطح'], ['Sun loungers & umbrellas', 'كراسي استرخاء ومظلات'], ['Spa recovery sessions', 'جلسات سبا للاسترخاء'],
      ['Ladies’ and men’s times', 'أوقات للسيدات وللرجال'], ['Open to non-members', 'متاح لغير المشتركين'], ['Pool parties & events', 'حفلات وفعاليات'],
    ],
    facts: [
      { label: ['Latest published hours', 'آخر أوقات منشورة'], value: ['Daily 9:00 AM – 5:00 PM', 'يومياً ٩:٠٠ ص – ٥:٠٠ م'], date: '2026-10-01', source: p('Dd9Y8eiCPkF') },
      { label: ['Summer 2026', 'صيف ٢٠٢٦'], value: ['Daily 9:30 AM – 6:00 PM', 'يومياً ٩:٣٠ ص – ٦:٠٠ م'], date: '2026-07-04', source: p('DaX5eillXhA'), past: true },
      { label: ['Men’s pool day entry', 'دخول المسبح للرجال'], value: ['All week from 4 Jul 2026 · 5 JD members · 10 JD non-members', 'طوال الأسبوع من ٤/٧/٢٠٢٦ · ٥ دنانير للمشتركين · ١٠ دنانير لغير المشتركين'], date: '2026-07-03', source: p('DaVOb2yDzqM'), past: true },
      { label: ['Ladies’ pool hours', 'أوقات السيدات'], value: ['Daily 9:00 AM – 5:00 PM', 'يومياً ٩:٠٠ ص – ٥:٠٠ م'], date: '2026-08-06', source: p('Dbsnf4Qjt78'), past: true },
      { label: ['2025 season', 'موسم ٢٠٢٥'], value: ['Ladies Sun/Tue/Thu · men Sat/Mon/Wed · 10 AM – 7 PM', 'السيدات الأحد/الثلاثاء/الخميس · الرجال السبت/الاثنين/الأربعاء · ١٠ ص – ٧ م'], date: '2025-06-11', source: p('DKw0rtJK2U6'), past: true },
    ],
    faqs: [
      { q: ['Is the pool open all year?', 'هل المسبح مفتوح طوال السنة؟'], a: ['It is an outdoor pool that has opened each summer (late May 2025, June 2026). Ask the team whether it is open on the day you plan to visit.', 'المسبح خارجي ويفتح في كل صيف (أواخر أيار ٢٠٢٥ وحزيران ٢٠٢٦). اسأل الفريق إن كان مفتوحاً في اليوم الذي تنوي زيارته.'] },
      { q: ['Can I use the pool without a gym membership?', 'هل يمكنني استخدام المسبح دون اشتراك في الجيم؟'], a: ['Yes — the club has published a day price for non-members. Call ahead to confirm today’s price and session times.', 'نعم، نشر النادي سعر دخول لغير المشتركين. اتصل مسبقاً لتأكيد سعر اليوم وأوقات الدوام.'] },
    ],
    cta: { kind: 'tour', interest: 'Pool & spa', label: ['Ask about the pool', 'استفسر عن المسبح'] },
    related: ['swimming-academy', 'lounge', 'ladies'],
    featured: ['DM2gP2wRIst', 'Dd9Y8eiCPkF', 'DaX5eillXhA', 'DKwyLKUC-n_', 'DLPNhjNpUG_', 'DNIxQACRFpb', 'DGSgZ_CMs_m'],
  },
  {
    slug: 'swimming-academy', path: '/services/swimming-academy', icon: 'swim',
    name: ['Swimming lessons', 'دورات السباحة'], kicker: ['LEARN TO SWIM', 'تعلّم السباحة'],
    headline: ['Swimming courses for kids, women and adults.', 'دورات سباحة للأطفال والسيدات والكبار.'],
    intro: ['Group and private swimming courses with professional coaches in a heated pool — for every level from beginner to advanced. In summer 2026 the courses ran with North Sharks Academy.', 'دورات سباحة جماعية وخاصة مع مدربين محترفين في مسبح مدفأ — لجميع المستويات من المبتدئين حتى المتقدمين. في صيف ٢٠٢٦ أقيمت الدورات بالتعاون مع أكاديمية North Sharks.'],
    hero: hero('swimming-academy', 1080, 1346, ['Swimming lanes in the Hydrogen pool.', 'حارات السباحة في مسبح هايدروجين.']),
    highlights: [
      ['Kids from age 6', 'للأطفال من عمر ٦ سنوات'], ['Women-only courses', 'دورات خاصة بالسيدات'], ['Groups of 6–8', 'مجموعات من ٦–٨'],
      ['Private lessons', 'تدريب شخصي'], ['Heated pool', 'مسبح مدفأ'], ['Therapy swimming', 'دورات علاجية'],
    ],
    facts: [
      { label: ['Group course', 'الدورة الجماعية'], value: ['6–8 swimmers · 10 sessions · 70 JD', '٦–٨ أشخاص · ١٠ حصص · ٧٠ دينار'], date: '2026-07-02', source: p('DaS1nLzleHn'), past: true },
      { label: ['Private swimming', 'التدريب الشخصي'], value: ['10 sessions · 180 JD', '١٠ حصص · ١٨٠ دينار'], date: '2026-07-02', source: p('DaS1nLzleHn'), past: true },
      { label: ['Therapy swimming', 'دورات الثيرابي العلاجية'], value: ['12 sessions · 200 JD', '١٢ حصة · ٢٠٠ دينار'], date: '2025-06-12', source: p('DKzcyOdREim'), past: true },
      { label: ['Kids (North Sharks, 2026)', 'الأطفال (North Sharks ٢٠٢٦)'], value: ['Sat, Mon, Wed · 9–10 AM, 10–11 AM, 5–6 PM · from 4 Jul 2026', 'السبت والاثنين والأربعاء · ٩–١٠ ص، ١٠–١١ ص، ٥–٦ م · من ٤/٧/٢٠٢٦'], date: '2026-06-27', source: p('DaGORnjI7ko'), past: true },
      { label: ['Kids summer course', 'دورة الأطفال الصيفية'], value: ['Ages 6+ · Sat, Mon, Wed · 11 AM–12 PM or 6–7 PM · from 13 Jul 2026', 'من ٦ سنوات · السبت والاثنين والأربعاء · ١١–١٢ ظهراً أو ٦–٧ مساءً · من ١٣/٧/٢٠٢٦'], date: '2026-07-09', source: p('Dakp3CGFT9i'), past: true },
      { label: ['Women’s course', 'دورة السيدات'], value: ['Female coaches · Sun, Tue, Thu', 'بإشراف مدربات · الأحد والثلاثاء والخميس'], date: '2026-07-13', source: p('DavPdFvAppE'), past: true },
    ],
    faqs: [
      { q: ['What age can my child start?', 'من أي عمر يمكن لطفلي البدء؟'], a: ['The published kids’ courses are for ages 6 and up.', 'دورات الأطفال المنشورة للأعمار من ٦ سنوات فما فوق.'] },
      { q: ['When is the next course?', 'متى الدورة القادمة؟'], a: ['Courses are announced before each season and places are limited. Send an enquiry and the team will tell you the next start date.', 'يُعلن عن الدورات قبل كل موسم والأماكن محدودة. أرسل استفساراً وسيخبرك الفريق بموعد الدورة القادمة.'] },
    ],
    cta: { kind: 'class', interest: 'Swimming course', label: ['Register interest', 'سجّل اهتمامك'] },
    related: ['kids', 'pool-spa', 'ladies'],
    featured: ['DaGORnjI7ko', 'DMpxOiwCCbH', 'DLLJ7SSi94C', 'DbQ_6asK8i3', 'DaF7gI0IYaY', 'DKzcyOdREim', 'DaS1nLzleHn'],
  },
  {
    slug: 'kids', path: '/services/kids', icon: 'baby',
    name: ['Kids programmes', 'برامج الأطفال'], kicker: ['YOUNG ATHLETES', 'أبطال المستقبل'],
    headline: ['Confidence starts young.', 'الثقة تبدأ من الصغر.'],
    intro: ['Swimming courses from age 6, martial-arts courses — boxing, MMA, Muay Thai and Jiu-Jitsu — and school-holiday programmes that build confidence, discipline and a love of sport.', 'دورات سباحة من عمر ٦ سنوات، ودورات فنون قتالية — بوكسينج وMMA ومواي تاي وجوجيتسو — وبرامج للعطل المدرسية تبني الثقة والانضباط وحب الرياضة.'],
    body: [['As the club puts it: it’s not only about teaching boxing — every punch a child learns grows their confidence. Kindergarten groups have visited for boxing days with Coach Mohammad and Coach Sanad Al-Talawi.', 'كما يقول النادي: الهدف ليس تعليم الملاكمة فقط، فكل لكمة يتعلمها الطفل تكبر معها ثقته. وقد زارت مجموعات من رياض الأطفال النادي في أيام بوكسينج مع الكوتش محمد والكوتش سند التلاوي.']],
    hero: hero('kids', 1320, 2347, ['Children at a boxing session.', 'أطفال في حصة بوكسينج.']),
    highlights: [
      ['Swimming from age 6', 'سباحة من عمر ٦'], ['Kids’ boxing', 'بوكسينج للأطفال'], ['MMA, Muay Thai, Jiu-Jitsu', 'MMA ومواي تاي وجوجيتسو'],
      ['Holiday courses', 'دورات العطل'], ['School & kindergarten visits', 'زيارات المدارس والروضات'], ['Professional coaches', 'مدربون محترفون'],
    ],
    facts: [
      { label: ['Kids’ swimming', 'سباحة الأطفال'], value: ['Ages 6+ · Sat, Mon, Wed', 'من ٦ سنوات · السبت والاثنين والأربعاء'], date: '2026-08-03', source: p('DblA1BqDiVW'), past: true },
      { label: ['Holiday martial-arts courses', 'دورات الفنون القتالية في العطلة'], value: ['Boxing, MMA, Muay Thai, Jiu-Jitsu', 'بوكسينج، MMA، مواي تاي، جوجيتسو'], date: '2025-12-30', source: p('DS4e25ijJzS'), past: true },
      { label: ['Kindergarten boxing day', 'يوم بوكسينج لأطفال الروضة'], value: ['With national boxer Coach Mohammad Al-Talawi', 'مع الملاكم الوطني الكوتش محمد التلاوي'], date: '2026-09-25', source: p('Ddt1NIhsgq4') },
    ],
    faqs: [
      { q: ['Can schools or kindergartens visit?', 'هل يمكن للمدارس والروضات الزيارة؟'], a: ['The club has welcomed kindergarten groups. Send a contact request to arrange a group visit.', 'استقبل النادي مجموعات من رياض الأطفال. أرسل طلب تواصل لترتيب زيارة جماعية.'] },
      { q: ['Do parents need to stay?', 'هل يجب أن يبقى الأهل؟'], a: ['Ask the team about drop-off and supervision rules for your child’s course.', 'اسأل الفريق عن تعليمات التوصيل والإشراف الخاصة بدورة طفلك.'] },
    ],
    cta: { kind: 'class', interest: 'Kids programme', label: ['Ask about kids’ courses', 'استفسر عن دورات الأطفال'] },
    related: ['swimming-academy', 'martial-arts', 'events'],
    featured: ['DfVAy3ctiXa', 'Dd6qI3wIEah', 'Ddt1NIhsgq4', 'DMpxOiwCCbH', 'DPHNrklDILh', 'DS4e25ijJzS'],
  },
  {
    slug: 'personal-training', path: '/services/personal-training', icon: 'user',
    name: ['Personal training', 'التدريب الشخصي'], kicker: ['ONE-TO-ONE', 'تدريب فردي'],
    headline: ['A coach in your corner.', 'مدرب يرافقك خطوة بخطوة.'],
    intro: ['Professional trainers follow your progress step by step — on the gym floor, in the pool, in the Pilates room and in the combat hall.', 'مدربون محترفون يتابعون تقدّمك خطوة بخطوة — في صالة الجيم، وفي المسبح، وفي غرفة البيلاتس، وفي صالة القتال.'],
    body: [['Want to become a trainer yourself? In September 2026 Hydrogen hosted, for the first time in Irbid, the JO FIT Certified Personal Trainer (CPT) course accredited by the US-based NCSF.', 'تحلم أن تصبح مدرباً؟ في أيلول ٢٠٢٦ استضاف هايدروجين لأول مرة في إربد دورة المدرب الشخصي المعتمد CPT من JO FIT باعتماد NCSF الأمريكية.']],
    hero: hero('personal-training', 1637, 2048, ['A trainer guiding a member on a machine.', 'مدرب يوجّه متدرباً على أحد الأجهزة.']),
    highlights: [
      ['Gym coaching', 'تدريب في الجيم'], ['Private Pilates', 'بيلاتس خاص'], ['Private swimming', 'سباحة فردية'],
      ['Combat coaching', 'تدريب قتالي'], ['Women coaches', 'مدربات'], ['Trainer certification (CPT)', 'شهادة المدرب الشخصي CPT'],
    ],
    facts: [
      { label: ['Private swimming', 'سباحة فردية'], value: ['10 sessions · 180 JD', '١٠ حصص · ١٨٠ دينار'], date: '2026-07-02', source: p('DaS1nLzleHn'), past: true },
      { label: ['Private reformer Pilates', 'بيلاتس ريفورمر خاص'], value: ['12 sessions a month · 160 JD', '١٢ حصة شهرياً · ١٦٠ دينار'], date: '2025-08-16', source: p('DNbCr-etD9t'), past: true },
      { label: ['New coaches', 'مدربون جدد'], value: ['Captain Yazid Abu Laila and Captain Mahmoud Al-Kawamleh joined the team', 'انضم الكابتن يزيد أبو ليلى والكابتن محمود الكواملة إلى الفريق'], date: '2025-12-31', source: p('DS7NMeoCI0n') },
      { label: ['JO FIT CPT course', 'دورة CPT من JO FIT'], value: ['NCSF-accredited · first time in Irbid', 'باعتماد NCSF · لأول مرة في إربد'], date: '2026-09-08', source: p('DdB2x9aDYTw'), past: true },
    ],
    faqs: [
      { q: ['How do I choose a trainer?', 'كيف أختار مدرباً؟'], a: ['Tell the team your goal and the times you can train; they will match you with a coach.', 'أخبر الفريق بهدفك والأوقات المناسبة لك، وسيرشحون لك المدرب المناسب.'] },
      { q: ['What does gym personal training cost?', 'كم سعر التدريب الشخصي في الجيم؟'], a: ['The club hasn’t published a gym PT price list. Ask for a quote with your goals and schedule.', 'لم ينشر النادي قائمة أسعار للتدريب الشخصي في الجيم. اطلب عرض سعر حسب هدفك وجدولك.'] },
    ],
    cta: { kind: 'training', interest: 'Personal training', label: ['Find my coach', 'اعثر على مدربك'] },
    related: ['gym', 'pilates', 'martial-arts'],
    coaches: [
      { name: ['Captain Yazid Abu Laila', 'الكابتن يزيد أبو ليلى'], role: ['Joined the coaching team (Dec 2025)', 'انضم إلى فريق التدريب (كانون الأول ٢٠٢٥)'], source: p('DS7NMeoCI0n') },
      { name: ['Captain Mahmoud Al-Kawamleh', 'الكابتن محمود الكواملة'], role: ['Joined the coaching team (Dec 2025)', 'انضم إلى فريق التدريب (كانون الأول ٢٠٢٥)'], source: p('DS7NMeoCI0n') },
      ...(timetableCoaches ?? []),
    ],
    links: [{ label: ['Meet the coaches', 'تعرّف على المدربين'], href: '/coaches' }, { label: ['Plan your training', 'خطط لتدريبك'], href: '/training' }],
    featured: ['DS7NMeoCI0n', 'DdB2x9aDYTw', 'DdtkVNrtcws', 'DfSI2HPtJeG', 'DSz-dkHjCOr'],
  },
  {
    slug: 'hydro-rest', path: '/services/hydro-rest', icon: 'salad',
    name: ['Hydro Rest & nutrition', 'هايدرو ريست والتغذية'], kicker: ['HEALTHY KITCHEN', 'مطبخ صحي'],
    headline: ['Refuel right after every session.', 'غذِّ جسمك بالشكل الصحيح بعد كل تمرين.'],
    intro: ['“Eat clean. Train mean.” Hydro Rest is the club’s healthy restaurant, café and protein store — a full menu from 2 JD, calorie-counted meals, monthly meal subscriptions, a nutritionist on site and delivery on Talabat.', '«Eat clean. Train mean.» هايدرو ريست هو المطعم الصحي والمقهى ومتجر البروتين في النادي — منيو كامل يبدأ من ٢ دينار، ووجبات محسوبة السعرات، واشتراكات شهرية للوجبات، وأخصائية تغذية في النادي، وتوصيل عبر طلبات.'],
    body: [['Opened in May 2025, Hydro Rest serves dishes like grilled salmon, protein omelettes with American coffee and healthy chicken meals — fresh, balanced and calorie-counted.', 'افتُتح هايدرو ريست في أيار ٢٠٢٥، ويقدّم أطباقاً مثل السلمون المشوي وأومليت البروتين مع القهوة الأمريكية ووجبات الدجاج الصحية — طازجة ومتوازنة ومحسوبة السعرات.']],
    hero: hero('hydro-rest', 1080, 1350, ['The Hydro Rest counter inside the club.', 'كاونتر هايدرو ريست داخل النادي.']),
    highlights: [
      ['Calorie-counted meals', 'وجبات محسوبة السعرات'], ['Monthly meal plans', 'اشتراكات شهرية للوجبات'], ['Nutritionist on site', 'أخصائية تغذية'],
      ['Protein store', 'متجر البروتين'], ['Coffee & post-workout drinks', 'قهوة ومشروبات بعد التمرين'], ['Delivery on Talabat', 'توصيل عبر طلبات'],
    ],
    facts: [
      { label: ['Nutritionist', 'أخصائية التغذية'], value: ['Daily 9:00 AM – 5:00 PM', 'يومياً ٩:٠٠ ص – ٥:٠٠ م'], date: '2026-10-10', source: p('DeTpgyPI2-9') },
      { label: ['Delivery', 'التوصيل'], value: ['Now on Talabat', 'متوفر الآن على طلبات'], date: '2026-10-31', source: p('DfKq8jsoxTV') },
      { label: ['Hydro+ plan', 'اشتراك Hydro+'], value: ['Chicken, meat, fish or salads of your choice · 180 JD / month', 'دجاج أو لحم أو سمك أو سلطات حسب اختيارك · ١٨٠ دينار شهرياً'], date: '2025-07-20', source: p('DMVD08HR15B'), past: true },
      { label: ['Mix+ plan', 'اشتراك Mix+'], value: ['Chicken, meat or fish · 120 JD / month', 'دجاج أو لحم أو سمك · ١٢٠ دينار شهرياً'], date: '2025-07-20', source: p('DMVD08HR15B'), past: true },
      { label: ['Pro+ plan', 'اشتراك Pro+'], value: ['Chicken or meat · 110 JD / month', 'دجاج أو لحم · ١١٠ دينار شهرياً'], date: '2025-07-20', source: p('DMVD08HR15B'), past: true },
      { label: ['Eco+ plan', 'اشتراك Eco+'], value: ['Healthy chicken meals · 100 JD / month', 'وجبات الدجاج الصحية · ١٠٠ دينار شهرياً'], date: '2025-07-20', source: p('DMVD08HR15B'), past: true },
      { label: ['Salad plates', 'أطباق السلطات'], value: ['75 JD / month · daily except Friday', '٧٥ دينار شهرياً · يومياً ما عدا الجمعة'], date: '2025-07-20', source: p('DMVD08HR15B'), past: true },
    ],
    faqs: [
      { q: ['Can non-members eat at Hydro Rest?', 'هل يمكن لغير المشتركين تناول الطعام في هايدرو ريست؟'], a: ['Hydro Rest also delivers through Talabat. Ask the team about dining in if you are not a member.', 'يوصل هايدرو ريست أيضاً عبر طلبات. اسأل الفريق عن تناول الطعام داخل النادي لغير المشتركين.'] },
      { q: ['Can the nutritionist build my plan?', 'هل تستطيع أخصائية التغذية إعداد خطتي؟'], a: ['The nutritionist is available daily from 9 AM to 5 PM. Ask the team about booking a consultation.', 'أخصائية التغذية متوفرة يومياً من ٩ صباحاً حتى ٥ مساءً. اسأل الفريق عن حجز استشارة.'] },
    ],
    cta: { kind: 'contact', interest: 'Hydro Rest meal plan / nutrition', label: ['Ask about meal plans', 'استفسر عن اشتراك الوجبات'] },
    related: ['gym', 'lounge', 'personal-training'],
    menu: {
      note: ['From the Hydro Rest menu posted on @hydrorest (about August 2025). Prices may have changed — ask at the counter.', 'من منيو هايدرو ريست المنشور على ‎@hydrorest (حوالي آب ٢٠٢٥). قد تتغير الأسعار — اسأل على الكاونتر.'],
      source: 'https://www.instagram.com/stories/highlights/17939036148024881/',
      pages: ['/images/hydro-rest/menu-page-1.webp', '/images/hydro-rest/menu-page-2.webp', '/images/hydro-rest/menu-page-3.webp'],
      sections: [
        { title: ['Pasta', 'باستا'], items: [
          { name: ['Pesto Pasta', 'بيستو باستا'], desc: ['150 g pasta with 150 g grilled chicken in a creamy basil pesto sauce', '١٥٠ غم معكرونة مع ١٥٠ غم دجاج مشوي بصلصة الريحان الكريمية'], prices: [{ jd: '4.00' }] },
          { name: ['Pink Pasta', 'بينك باستا'], desc: ['150 g pasta with 150 g grilled chicken in a creamy Italian tomato sauce', '١٥٠ غم معكرونة مع ١٥٠ غم دجاج مشوي بصلصة الطماطم الإيطالية الكريمية'], prices: [{ jd: '4.00' }] },
          { name: ['Alfredo Pasta', 'ألفريدو باستا'], desc: ['150 g pasta with 150 g grilled chicken in a creamy Alfredo sauce', '١٥٠ غم معكرونة مع ١٥٠ غم دجاج مشوي بصلصة ألفريدو الكريمية'], prices: [{ jd: '4.00' }] },
        ] },
        { title: ['Chicken', 'دجاج'], items: [
          { name: ['Chicken Pesto', 'دجاج بيستو'], desc: ['150 g grilled chicken breast, pesto sauce, rice or mashed potato & sautéed vegetables', '١٥٠ غم صدر دجاج مشوي بصلصة البيستو، مع أرز أو بطاطا مهروسة وخضار سوتيه'], prices: [{ jd: '4.50' }] },
          { name: ['Chicken Mushroom', 'دجاج بالفطر'], desc: ['150 g grilled chicken breast, creamy mushroom sauce, rice or mashed potato & sautéed vegetables', '١٥٠ غم صدر دجاج مشوي بصلصة كريمية وشرائح الفطر، مع أرز أو بطاطا مهروسة وخضار سوتيه'], prices: [{ jd: '4.50' }] },
          { name: ['Chicken Rocca', 'دجاج روكا'], desc: ['150 g grilled chicken breast, rocca sauce, rice or mashed potato & sautéed vegetables', '١٥٠ غم صدر دجاج مشوي بصلصة الروكا، مع أرز أو بطاطا مهروسة وخضار سوتيه'], prices: [{ jd: '4.50' }] },
          { name: ['Chicken Shish', 'شيش دجاج'], desc: ['150 g grilled chicken breast with lemon sauce and 150 g rice', '١٥٠ غم صدر دجاج مشوي بصلصة الليمون مع ١٥٠ غم أرز'], prices: [{ jd: '4.50' }] },
          { name: ['Chicken Masala', 'دجاج ماسالا'], desc: ['150 g grilled chicken breast, mild Indian masala sauce, 150 g rice', '١٥٠ غم صدر دجاج مشوي بصلصة الماسالا الهندية الخفيفة مع ١٥٠ غم أرز'], prices: [{ jd: '4.50' }] },
        ] },
        { title: ['Steak & salmon', 'ستيك وسلمون'], items: [
          { name: ['Gravy Steak', 'جريفي ستيك'], desc: ['150 g grilled beef steak with gravy, rice or mashed potato & sautéed vegetables', '١٥٠ غم ستيك لحم بقري مشوي بصلصة الجريفي، مع أرز أو بطاطا مهروسة وخضار سوتيه'], prices: [{ jd: '6.00' }] },
          { name: ['Dijon Steak', 'ديجون ستيك'], desc: ['150 g grilled beef steak with Dijon sauce, rice or mashed potato & sautéed vegetables', '١٥٠ غم ستيك لحم بقري مشوي بصلصة الديجون، مع أرز أو بطاطا مهروسة وخضار سوتيه'], prices: [{ jd: '6.00' }] },
          { name: ['Grilled Salmon', 'سلمون مشوي'], desc: ['150 g grilled salmon fillet with creamy lemon sauce, rice or mashed potato & sautéed vegetables', '١٥٠ غم فيليه سلمون مشوي بصلصة الليمون الكريمية، مع أرز أو بطاطا مهروسة وخضار سوتيه'], prices: [{ jd: '7.00' }] },
        ] },
        { title: ['Sandwiches', 'ساندويشات'], items: [
          { name: ['Roast Beef', 'روست بيف'], desc: ['Roast beef, cheddar, arugula & tomato, cream-cheese sauce, whole-wheat panini', 'روست بيف وشيدر وجرجير وطماطم مع صلصة الجبنة الكريمية بخبز بانيني من القمح الكامل'], prices: [{ label: ['Meal', 'وجبة'], jd: '3.00' }, { label: ['Sandwich', 'ساندويش'], jd: '2.00' }] },
          { name: ['Turkey', 'تيركي'], desc: ['Turkey, cheddar, lettuce & tomato, cream-cheese sauce, whole-wheat panini', 'ديك رومي وشيدر وخس وطماطم مع صلصة الجبنة الكريمية بخبز بانيني من القمح الكامل'], prices: [{ label: ['Meal', 'وجبة'], jd: '3.00' }, { label: ['Sandwich', 'ساندويش'], jd: '2.00' }] },
          { name: ['Pesto Halloumi', 'حلوم بيستو'], desc: ['Grilled halloumi, arugula & tomato, pesto sauce, whole-wheat panini, with vegetables', 'حلوم مشوي وجرجير وطماطم بصلصة البيستو بخبز بانيني من القمح الكامل مع الخضار'], prices: [{ label: ['Meal', 'وجبة'], jd: '4.00' }, { label: ['Sandwich', 'ساندويش'], jd: '3.00' }] },
          { name: ['Omelette', 'أومليت'], desc: ['Eggs with arugula & tomato, cream-cheese sauce, whole-wheat panini, with vegetables', 'أومليت مع جرجير وطماطم وصلصة الجبنة الكريمية بخبز بانيني من القمح الكامل مع الخضار'], prices: [{ label: ['Meal', 'وجبة'], jd: '4.00' }, { label: ['Sandwich', 'ساندويش'], jd: '3.00' }] },
          { name: ['Ricotta Cheese', 'جبنة الريكوتا'], desc: ['Ricotta with fig and cranberry on whole-wheat bread, with fresh vegetables', 'جبنة ريكوتا مع التين والتوت البري على خبز القمح الكامل مع الخضار الطازجة'], prices: [{ jd: '4.00' }] },
        ] },
        { title: ['Add-ons & protein by weight', 'إضافات وبروتين بالوزن'], items: [
          { name: ['Grilled chicken', 'دجاج مشوي'], prices: [{ label: ['50 g', '٥٠ غم'], jd: '1.00' }, { label: ['100 g', '١٠٠ غم'], jd: '1.75' }, { label: ['150 g', '١٥٠ غم'], jd: '2.50' }, { label: ['200 g', '٢٠٠ غم'], jd: '3.00' }] },
          { name: ['Beef steak', 'ستيك لحم بقري'], prices: [{ label: ['50 g', '٥٠ غم'], jd: '1.50' }, { label: ['100 g', '١٠٠ غم'], jd: '2.50' }, { label: ['150 g', '١٥٠ غم'], jd: '3.50' }, { label: ['200 g', '٢٠٠ غم'], jd: '4.25' }] },
          { name: ['White rice', 'أرز أبيض'], prices: [{ label: ['150 g with a meal', '١٥٠ غم مع وجبة'], jd: '0.75' }, { label: ['200 g plate', 'طبق ٢٠٠ غم'], jd: '1.50' }] },
          { name: ['Sautéed vegetables (150 g)', 'خضار سوتيه (١٥٠ غم)'], prices: [{ jd: '1.00' }] },
          { name: ['Healthy sauces (30 g)', 'صوصات صحية (٣٠ غم)'], prices: [{ jd: '0.75' }] },
          { name: ['Mashed potato (100 g)', 'بطاطا مهروسة (١٠٠ غم)'], prices: [] },
        ] },
      ],
    },
    links: [{ label: ['@hydrorest on Instagram', '‎@hydrorest على إنستغرام'], href: 'https://www.instagram.com/hydrorest/', external: true }],
    featured: ['DMArpvGtBAB', 'DcgXKyFjmnp', 'DMVD08HR15B', 'DeTpgyPI2-9', 'DfKq8jsoxTV', 'DO8rTH8AFnz', 'DQPOLAUACyJ', 'DKPBIiQCIcF'],
  },
  {
    slug: 'lounge', path: '/services/lounge', icon: 'moon',
    name: ['Hydrogen Lounge', 'هايدروجين لاونج'], kicker: ['EVENINGS', 'الأمسيات'],
    headline: ['Big matches, slow evenings.', 'مباريات كبيرة وأمسيات هادئة.'],
    intro: ['A premium rooftop lounge by the pool — coffee, drinks and food with sunset views over Irbid, big-screen football nights and themed evenings. Open to everyone, not only members.', 'لاونج على السطح بجانب المسبح — قهوة ومشروبات وأكل مع إطلالة على غروب إربد، وسهرات مباريات على شاشة كبيرة، وأمسيات خاصة. مفتوح للجميع وليس للمشتركين فقط.'],
    body: [
      ['“More than a lounge — an experience,” as its own Instagram puts it. Expect specialty coffee and desserts like cheesecake, milkshakes, fresh lemon & mint and handcrafted mocktails, served poolside with the city lights below. Birthdays are welcome — the lounge has posted its own “make a wish” celebrations.', '«أكثر من لاونج… تجربة» كما يصف نفسه على إنستغرام. قهوة مميزة وحلويات مثل التشيز كيك، وميلك شيك، وليمون ونعنع منعش، وموكتيلات محضّرة بعناية، تُقدَّم بجانب المسبح وأضواء المدينة تحتك. وأعياد الميلاد أهلاً وسهلاً — اللاونج نشر احتفالات «Make a wish» الخاصة فيه.'],
      ['The lounge has screened the 2026 World Cup, El Clásico and Champions League nights, and hosts Ladies Night dinners. A new venue for special occasions, Hydrogen Garden, has been announced as opening soon.', 'عرض اللاونج مباريات كأس العالم ٢٠٢٦ والكلاسيكو ودوري الأبطال، ويستضيف أمسيات Ladies Night. كما أُعلن عن قرب افتتاح Hydrogen Garden، وجهة جديدة للمناسبات الخاصة.'],
    ],
    hero: hero('lounge', 1800, 1013, ['Hydrogen Lounge and the rooftop pool at night.', 'هايدروجين لاونج والمسبح على السطح ليلاً.']),
    highlights: [
      ['Open daily 6 PM – 2 AM', 'يومياً ٦ م – ٢ ص'], ['Rooftop & sunset views', 'سطح وإطلالة على الغروب'], ['Coffee, drinks & food', 'قهوة ومشروبات وأكل'],
      ['Giant-screen matches', 'مباريات على شاشة عملاقة'], ['Birthdays & Ladies Night', 'أعياد ميلاد وLadies Night'], ['Open to everyone', 'مفتوح للجميع'],
    ],
    facts: [
      { label: ['Hours', 'أوقات الدوام'], value: ['Daily 6:00 PM – 2:00 AM', 'يومياً ٦:٠٠ م – ٢:٠٠ ص'], date: '2026-07-29', source: p('DbY_mTJIkc2') },
      { label: ['Reservations', 'الحجوزات'], value: ['079 837 0157 (lounge line)', '٠٧٩٨٣٧٠١٥٧ (خط اللاونج)'], date: '2026-08-20', source: 'https://www.instagram.com/hydrogen.lounge/p/DcQkM0wDo7z/' },
      { label: ['What’s served', 'ماذا يقدّم'], value: ['Coffee · drinks · food — specialty coffee, desserts, milkshakes, mocktails', 'قهوة · مشروبات · أكل — قهوة مميزة وحلويات وميلك شيك وموكتيلات'], date: '2026-11-09', source: 'https://www.instagram.com/hydrogen.lounge/' },
      { label: ['Who can come', 'لمن؟'], value: ['Everyone — not only members', 'للجميع وليس للمشتركين فقط'], date: '2026-08-02', source: p('Dbh-UDXgBbK') },
      { label: ['Membership voucher', 'قسيمة الاشتراك'], value: ['Join for a month, get a 10 JD lounge voucher', 'اشترك شهراً واحصل على قسيمة بقيمة ١٠ دنانير من اللاونج'], date: '2026-09-16', source: p('DdYRaVDIeMj'), past: true },
      { label: ['Latest match night', 'آخر سهرة مباراة'], value: ['Barcelona vs Atlético Madrid · 8 Nov 2026, 11:00 PM', 'برشلونة × أتلتيكو مدريد · ٨/١١/٢٠٢٦، ١١:٠٠ م'], date: '2026-11-08', source: p('Dfd4JZRCqE-') },
    ],
    faqs: [
      { q: ['Do I need to book for match nights?', 'هل أحتاج إلى الحجز في ليالي المباريات؟'], a: ['Big matches fill up — the club has asked guests to reserve their seats. Call ahead.', 'المباريات الكبيرة تمتلئ بسرعة، وقد طلب النادي من الضيوف حجز أماكنهم. اتصل مسبقاً.'] },
      { q: ['Is the lounge only for members?', 'هل اللاونج للمشتركين فقط؟'], a: ['No. The club says the lounge is open to everyone.', 'لا. يقول النادي إن اللاونج مفتوح للجميع.'] },
      { q: ['Can I celebrate a birthday there?', 'هل أقدر أحتفل بعيد ميلاد في اللاونج؟'], a: ['Yes — the lounge has posted birthday celebrations. Call 079 837 0157 to arrange a table and a cake.', 'نعم، نشر اللاونج احتفالات أعياد ميلاد. اتصل على ٠٧٩٨٣٧٠١٥٧ لترتيب طاولة وكيكة.'] },
    ],
    cta: { kind: 'contact', interest: 'Hydrogen Lounge reservation', label: ['Reserve a table', 'احجز طاولة'] },
    phone: { display: '079 837 0157', tel: '+962798370157', label: ['Lounge reservations', 'حجوزات اللاونج'] },
    related: ['pool-spa', 'hydro-rest', 'events'],
    links: [{ label: ['@hydrogen.lounge on Instagram', '‎@hydrogen.lounge على إنستغرام'], href: 'https://www.instagram.com/hydrogen.lounge/', external: true }, { label: ['Hydrogen Garden (opening soon)', 'Hydrogen Garden (قريباً)'], href: 'https://www.instagram.com/hydrogen_garden/', external: true }],
    featured: ['DbqJqrGuc2d', 'DbqJpqeOd1S', 'DbqJm_nOv-P', 'Db-tg-5lBFL', 'Db0MHu-Dh-C', 'DbsmYT2Ds8W', 'DcGQGGGDhA_', 'DcLdhmNDRq5', 'Dcqb2BxDrnL', 'DbnTgsqE4ZT', 'Db73aMJAAgH', 'DcvmfMIk-_S', 'DfXDBAxO5YP', 'De43yOEO4uf', 'De437YDO5eg', 'DbY_mTJIkc2', 'Dbh-UDXgBbK', 'DZ3MGPTod55'],
  },
  {
    slug: 'events', path: '/services/events', icon: 'calendar',
    name: ['Events & community', 'الفعاليات والمجتمع'], kicker: ['BEYOND THE GYM', 'أبعد من الجيم'],
    headline: ['A club that shows up for its community.', 'نادٍ حاضر في مجتمعه.'],
    intro: ['Hosting Al-Hussein SC training, black-belt exams, university partnerships, awareness events, trainer courses and group hikes — here is what has happened at and around Hydrogen.', 'استضافة تدريبات نادي الحسين وفحوصات الأحزمة السوداء، وشراكات مع الجامعات، وفعاليات توعوية، ودورات للمدربين، ورحلات جماعية — إليك أبرز ما حدث في هايدروجين وحوله.'],
    hero: hero('events', 720, 720, ['Members on the Wadi Al-Hasa hike.', 'المشاركون في رحلة وادي الحسا.']),
    highlights: [
      ['Al-Hussein SC partner', 'شريك نادي الحسين'], ['University partnerships', 'شراكات مع الجامعات'], ['Awareness events', 'فعاليات توعوية'],
      ['Trainer education', 'تأهيل المدربين'], ['Hikes & trips', 'رحلات ومسارات'], ['Federation exams', 'فحوصات الاتحادات'],
    ],
    facts: [],
    timeline: [
      { date: '2026-10-29', tag: 'event', title: ['HER Story breast-cancer awareness event', 'فعالية HER Story للتوعية بسرطان الثدي'], text: ['An afternoon of awareness and support at Hydrogen Lounge with partners and guests.', 'أمسية للتوعية والدعم في هايدروجين لاونج مع الشركاء والضيوف.'], source: p('DfH7vdhuRhA'), image: 'ig-DfCFKnlFJFT-01' },
      { date: '2026-09-16', tag: 'event', title: ['Visit by the Minister of Youth', 'زيارة وزير الشباب'], text: ['Dr. Raed Al-Adwan visited the club with members of parliament.', 'زار معالي الدكتور رائد العدوان النادي برفقة عدد من النواب.'], source: p('DdXVx1QgvaQ'), image: 'ig-DdXVx1QgvaQ-01' },
      { date: '2026-09-08', tag: 'event', title: ['JO FIT CPT course comes to Irbid', 'دورة CPT من JO FIT في إربد'], text: ['NCSF-accredited personal-trainer certification, hosted at Hydrogen for the first time in Irbid.', 'شهادة المدرب الشخصي باعتماد NCSF، تُقام لأول مرة في إربد في هايدروجين.'], source: p('DdB2x9aDYTw'), image: 'ig-DdB2x9aDYTw-01' },
      { date: '2026-08-09', tag: 'event', title: ['Black-belt exams', 'فحوصات الأحزمة السوداء'], text: ['Hosted under the Jordanian Kickboxing Federation’s exam committee.', 'بإشراف لجنة الفحص في الاتحاد الأردني للكيك بوكسينغ.'], source: p('Db0nRd9N9Hx'), image: 'ig-Db0nRd9N9Hx-01' },
      { date: '2026-08-05', tag: 'event', title: ['Partnership with Jadara University', 'مذكرة تفاهم مع جامعة جدارا'], text: ['A memorandum to give physical-education students hands-on training at the club.', 'لتعزيز التدريب العملي لطلبة قسم التربية البدنية في النادي.'], source: p('Dbqv7cMCHS8'), image: 'ig-Dbqv7cMCHS8-01' },
      { date: '2026-07-24', tag: 'event', title: ['Wadi Al-Hasa water hike', 'رحلة وادي الحسا المائي'], text: ['A summer trail organised in partnership with Hydrogen.', 'مسار صيفي بالشراكة مع هايدروجين.'], source: p('Da7uh62DaRJ'), image: 'ig-Da7uh62DaRJ-01' },
      { date: '2026-07-15', tag: 'event', title: ['Hosting Al-Hussein SC training', 'استضافة تدريبات نادي الحسين'], text: ['The club hosted the team’s training sessions as a partner.', 'استضاف النادي تدريبات الفريق كشريك داعم.'], source: p('Da0Jo5inEvh'), image: 'ig-Da0Jo5inEvh-01' },
      { date: '2025-07-15', tag: 'event', title: ['First anniversary', 'الذكرى السنوية الأولى'], text: ['Thanking every member who was part of the club’s first year.', 'شكراً لكل من كان جزءاً من عامنا الأول.'], source: p('DMFtCWLqPGa'), image: 'ig-DMFtCWLqPGa-01' },
    ],
    faqs: [
      { q: ['Can my company, school or team hold an event at Hydrogen?', 'هل يمكن لشركتي أو مدرستي أو فريقي إقامة فعالية في هايدروجين؟'], a: ['The club has hosted sports teams, federation exams, universities, kindergartens and awareness events. Send the details and the team will get back to you.', 'استضاف النادي فرقاً رياضية وفحوصات اتحادات وجامعات ورياض أطفال وفعاليات توعوية. أرسل التفاصيل وسيتواصل معك الفريق.'] },
      { q: ['How do I hear about the next event?', 'كيف أعرف بالفعالية القادمة؟'], a: ['Events are announced first on the club’s Instagram and Facebook pages.', 'يُعلن عن الفعاليات أولاً على صفحات النادي في إنستغرام وفيسبوك.'] },
    ],
    cta: { kind: 'contact', interest: 'Events & partnerships', label: ['Propose an event or partnership', 'اقترح فعالية أو شراكة'] },
    related: ['lounge', 'kids', 'martial-arts'],
    featured: ['DfKRpMGuxXY', 'DfH7vdhuRhA', 'Da7uh62DaRJ', 'DbattYgtAMO', 'Db0nRd9N9Hx', 'Da0Jo5inEvh'],
  },
];

// The News & offers page reuses the service template at /offers.
export const newsPage: Service = {
  slug: 'offers', path: '/offers', icon: 'tag',
  name: ['News & offers', 'الأخبار والعروض'], kicker: ['FROM THE CLUB', 'من النادي'],
  headline: ['Every offer and update, newest first.', 'كل العروض والمستجدات، الأحدث أولاً.'],
  intro: ['Hours changes, holiday closures, launches and the membership offers the club has published. Past offers are shown for reference only — call the club for today’s prices.', 'تغييرات الدوام، والعطل، والإطلاقات الجديدة، وعروض الاشتراك التي نشرها النادي. العروض السابقة للاطلاع فقط — اتصل بالنادي لمعرفة أسعار اليوم.'],
  hero: hero('offers', 1637, 2048, ['The club’s 2026 New Year membership offer poster.', 'ملصق عرض الاشتراكات بمناسبة السنة الجديدة ٢٠٢٦.']),
  highlights: [],
  facts: [
    { label: ['Latest published membership offer', 'آخر عرض اشتراك منشور'], value: ['1 month 40 JD · 3 months 100 JD (New Year offer, extended to 25 Dec 2025)', 'شهر ٤٠ دينار · ٣ أشهر ١٠٠ دينار (عرض السنة الجديدة، مُدّد حتى ٢٥/١٢/٢٠٢٥)'], date: '2025-12-24', source: p('DSp2oRbCCgk'), past: true },
    { label: ['Member perk', 'ميزة للمشتركين'], value: ['10% off at Adidas Irbid for Hydrogen+ members', 'خصم ١٠٪ لأعضاء +Hydrogen في Adidas إربد'], date: '2025-09-13', source: p('DOiynCxiKy1'), past: true },
  ],
  faqs: [
    { q: ['Is an offer on this page still valid?', 'هل العرض في هذه الصفحة ما زال سارياً؟'], a: ['Only if the club confirms it. Each item shows the date it was published — call 079 215 1000 to check.', 'فقط إذا أكده النادي. يظهر تاريخ نشر كل عرض — اتصل على ٠٧٩٢١٥١٠٠٠ للتأكد.'] },
  ],
  timeline: [
    { date: '2026-11-04', tag: 'opening', title: ['Aqua aerobics launches', 'إطلاق الأكوا إيروبيك'], text: ['A first for Irbid, with Coach Marwa. Members only; limited places.', 'لأول مرة في إربد مع كوتش مروى. للمشتركين فقط والأعداد محدودة.'], source: p('DNQsXJkozGu'), image: 'ig-DNQsXJkozGu-01' },
    { date: '2026-10-31', tag: 'news', title: ['Hydro Rest on Talabat', 'هايدرو ريست على طلبات'], text: ['Order your favourite Hydro Rest meals for delivery.', 'اطلب وجبات هايدرو ريست المفضلة لديك مع التوصيل.'], source: p('DfKq8jsoxTV'), image: 'ig-DfKq8jsoxTV-01' },
    { date: '2026-10-10', tag: 'hours', title: ['Nutritionist available daily', 'أخصائية التغذية يومياً'], text: ['9:00 AM – 5:00 PM.', '٩:٠٠ ص – ٥:٠٠ م.'], source: p('DeTpgyPI2-9'), image: 'ig-DeTpgyPI2-9-01' },
    { date: '2026-09-16', tag: 'offer', title: ['10 JD lounge voucher', 'قسيمة لاونج بقيمة ١٠ دنانير'], text: ['Join for one month and get a 10 JD Hydrogen Lounge voucher.', 'اشترك شهراً واحصل على قسيمة بقيمة ١٠ دنانير من هايدروجين لاونج.'], source: p('DdYRaVDIeMj'), image: 'ig-DdYRaVDIeMj-01' },
    { date: '2026-09-08', tag: 'offer', title: ['30% off the JO FIT CPT course', 'خصم ٣٠٪ على دورة CPT'], text: ['Limited-time discount on the trainer certification.', 'خصم لفترة محدودة على شهادة المدرب الشخصي.'], source: p('DdB2x9aDYTw'), image: 'ig-DdB2x9aDYTw-01' },
    { date: '2026-08-06', tag: 'hours', title: ['Ladies’ pool hours', 'أوقات مسبح السيدات'], text: ['Daily 9:00 AM – 5:00 PM.', 'يومياً ٩:٠٠ ص – ٥:٠٠ م.'], source: p('Dbsnf4Qjt78'), image: 'ig-Dbsnf4Qjt78-01' },
    { date: '2026-07-29', tag: 'hours', title: ['New ladies’ gym hours', 'دوام جديد للسيدات'], text: ['From 1 August 2026: 8:00 AM – 11:00 PM.', 'ابتداءً من ١/٨/٢٠٢٦: ٨:٠٠ ص – ١١:٠٠ م.'], source: p('DbYWJMxFVaA'), image: 'ig-DbYWJMxFVaA-01' },
    { date: '2026-07-29', tag: 'opening', title: ['Hydrogen Lounge opens nightly', 'هايدروجين لاونج يومياً'], text: ['Daily 6:00 PM – 2:00 AM.', 'يومياً ٦:٠٠ م – ٢:٠٠ ص.'], source: p('DbY_mTJIkc2'), image: 'ig-DbY_mTJIkc2-01' },
    { date: '2026-07-26', tag: 'closure', title: ['No ladies’ pool on 30 July', 'لا يوجد مسبح للسيدات يوم ٣٠ تموز'], text: ['Closed to ladies on Thursday 30/7/2026 for a private event.', 'نعتذر عن استقبال السيدات يوم الخميس ٣٠/٧/٢٠٢٦ بسبب فعالية خاصة.'], source: p('DbQKU0AFZ4L'), image: 'ig-DbQKU0AFZ4L-01' },
    { date: '2026-07-03', tag: 'offer', title: ['Men’s pool all week', 'مسبح الرجال طوال الأسبوع'], text: ['From 4 July 2026: 5 JD members, 10 JD non-members.', 'ابتداءً من ٤/٧/٢٠٢٦: ٥ دنانير للمشتركين و١٠ لغير المشتركين.'], source: p('DaVOb2yDzqM'), image: 'ig-DaVOb2yDzqM-01' },
    { date: '2026-06-27', tag: 'opening', title: ['Swimming courses with North Sharks', 'دورات سباحة مع North Sharks'], text: ['Kids from 4 July, women from 5 July 2026.', 'الأطفال من ٤ تموز والسيدات من ٥ تموز ٢٠٢٦.'], source: p('DaGORnjI7ko'), image: 'ig-DaGORnjI7ko-01' },
    { date: '2026-05-23', tag: 'closure', title: ['Eid al-Adha holiday', 'عطلة عيد الأضحى'], text: ['Closed from Tuesday 26/5/2026; reopening Saturday 30/5/2026.', 'العطلة من الثلاثاء ٢٦/٥/٢٠٢٦ والعودة يوم السبت ٣٠/٥/٢٠٢٦.'], source: p('DYsR5rSou_U'), image: 'ig-DYsR5rSou_U-01' },
    { date: '2026-05-23', tag: 'offer', title: ['Independence Day offer', 'عرض عيد الاستقلال'], text: ['20% off the monthly membership on Sunday and Monday only.', 'خصم ٢٠٪ على الاشتراك الشهري يومي الأحد والاثنين فقط.'], source: p('DYsJXkUo2F2'), image: 'ig-DYsJXkUo2F2-01' },
    { date: '2026-03-17', tag: 'closure', title: ['Eid al-Fitr holiday', 'عطلة عيد الفطر'], text: ['From Thursday 19/3/2026; reopening Monday 22/3/2026.', 'من الخميس ١٩/٣/٢٠٢٦ والعودة يوم الاثنين ٢٢/٣/٢٠٢٦.'], source: p('DV_7hW4iD8o'), image: 'ig-DV_7hW4iD8o-01' },
    { date: '2026-02-19', tag: 'hours', title: ['Ramadan hours', 'دوام رمضان'], text: ['Men 12–6 PM & 8:30 PM–2 AM · Ladies 12–5:30 PM & 8:30 PM–1 AM.', 'الرجال ١٢–٦ م و٨:٣٠ م–٢ ص · السيدات ١٢–٥:٣٠ م و٨:٣٠ م–١ ص.'], source: p('DU8KYELCcnM'), image: 'ig-DU8KYELCcnM-01' },
    { date: '2025-12-31', tag: 'closure', title: ['New Year’s Day', 'رأس السنة الميلادية'], text: ['Closed on New Year’s Day; back on Saturday.', 'عطلة يوم رأس السنة والعودة يوم السبت.'], source: p('DS7vcJRiL18'), image: 'ig-DS7vcJRiL18-01' },
    { date: '2025-12-30', tag: 'offer', title: ['Martial-arts courses 40 JD', 'دورات فنون قتالية بـ ٤٠ دينار'], text: ['One-month course, 3 sessions a week. Offer until 8/1/2026.', 'دورة لمدة شهر، ٣ حصص أسبوعياً. العرض حتى ٨/١/٢٠٢٦.'], source: p('DS4e25ijJzS'), image: 'ig-DS4e25ijJzS-01' },
    { date: '2025-12-24', tag: 'offer', title: ['New Year offer extended', 'تمديد عرض السنة الجديدة'], text: ['1 month 40 JD, 3 months 100 JD until Thursday 25/12/2025.', 'شهر ٤٠ دينار، ٣ أشهر ١٠٠ دينار حتى الخميس ٢٥/١٢/٢٠٢٥.'], source: p('DSp2oRbCCgk'), image: 'ig-DSp2oRbCCgk-01' },
    { date: '2025-12-21', tag: 'offer', title: ['New Year 2026 offer', 'عرض السنة الجديدة ٢٠٢٦'], text: ['Three days only: 1 month 40 JD, 3 months 100 JD.', 'لمدة ثلاثة أيام فقط: شهر ٤٠ دينار، ٣ أشهر ١٠٠ دينار.'], source: p('DSiOd0ej8q3'), image: 'ig-DSiOd0ej8q3-01' },
    { date: '2025-09-13', tag: 'offer', title: ['Adidas member discount', 'خصم Adidas للمشتركين'], text: ['10% off sportswear at Adidas Irbid for Hydrogen+ members.', 'خصم ١٠٪ على الملابس الرياضية في Adidas إربد لأعضاء +Hydrogen.'], source: p('DOiynCxiKy1'), image: 'ig-DOiynCxiKy1-01' },
    { date: '2025-09-01', tag: 'offer', title: ['Mawlid offer', 'عرض المولد النبوي'], text: ['Two months for 75 JD.', 'اشتراك شهرين بـ ٧٥ دينار.'], source: p('DOEibRvDN3a'), image: 'ig-DOEibRvDN3a-01' },
    { date: '2025-08-26', tag: 'news', title: ['Hiring: female fitness trainers', 'مطلوب مدربات لياقة'], text: ['3+ years’ experience. See Careers.', 'خبرة لا تقل عن ٣ سنوات. راجع صفحة الوظائف.'], source: p('DN1H_qRWBI9'), image: 'ig-DN1H_qRWBI9-01' },
    { date: '2025-08-16', tag: 'opening', title: ['Reformer Pilates room opens', 'افتتاح غرفة الريفورمر بيلاتس'], text: ['A first for Irbid.', 'لأول مرة في إربد.'], source: p('DNbCr-etD9t'), image: 'ig-DNbCr-etD9t-01' },
    { date: '2025-07-20', tag: 'offer', title: ['Hydro Rest meal subscriptions', 'اشتراكات وجبات هايدرو ريست'], text: ['Monthly plans from 75 JD (salads) to 180 JD.', 'اشتراكات شهرية من ٧٥ دينار (السلطات) حتى ١٨٠ دينار.'], source: p('DMVD08HR15B'), image: 'ig-DMVD08HR15B-01' },
    { date: '2025-06-23', tag: 'offer', title: ['Summer pool entry', 'دخولية المسبح الصيفية'], text: ['5 JD for gym members, 10 JD for non-members.', '٥ دنانير لمشتركي الجيم و١٠ لغير المشتركين.'], source: p('DLPNhjNpUG_'), image: 'ig-DLPNhjNpUG_-01' },
    { date: '2025-05-27', tag: 'opening', title: ['Hydro Rest restaurant opens', 'افتتاح مطعم هايدرو ريست'], text: ['The club’s healthy restaurant opened its doors.', 'افتتح مطعم النادي الصحي أبوابه.'], source: p('DKPBIiQCIcF'), image: 'ig-DKKR7eKi0i--01' },
    { date: '2025-05-26', tag: 'opening', title: ['Outdoor pool opens for 2025', 'افتتاح المسبح الخارجي ٢٠٢٥'], text: ['Opening week: free entry for members — ladies Tue & Wed, men Thu, 10 AM–7 PM.', 'أسبوع الافتتاح: دخول مجاني للمشتركين — السيدات الثلاثاء والأربعاء، والرجال الخميس، ١٠ ص–٧ م.'], source: p('DKILlUyi5zE'), image: 'ig-DKILlUyi5zE-01' },
    { date: '2025-03-19', tag: 'offer', title: ['Mother’s Day offer', 'عرض عيد الأم'], text: ['Three months for mothers: 100 JD.', 'اشتراك خاص للأمهات ٣ أشهر بـ ١٠٠ دينار.'], source: p('DHYi_5Doztv'), image: 'ig-DHYi_5Doztv-01' },
    { date: '2025-02-22', tag: 'offer', title: ['Ramadan offers', 'عروض رمضان'], text: ['1 month 40 JD, 3 months 100 JD.', 'شهر ٤٠ دينار، ٣ أشهر ١٠٠ دينار.'], source: p('DGY05anoW6E'), image: 'ig-DGY05anoW6E-01' },
  ],
  cta: { kind: 'membership', interest: 'Current membership offer', label: ['Ask about today’s offer', 'اسأل عن عرض اليوم'] },
  related: ['gym', 'ladies', 'pool-spa'],
};

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug) ?? (slug === 'offers' ? newsPage : undefined);
