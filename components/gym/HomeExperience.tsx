'use client';
import {useEffect} from 'react';
import HomeCinema from './HomeCinema';
import {ArrowDown,ArrowUpRight,CalendarDays,Check,Dumbbell,MapPin,UserRound} from 'lucide-react';
import {ServiceTile} from './ServicePage';
import {useGymLanguage} from './SiteShell';
import {PricesTeaser} from './Plans';
import {HomeToday,HomeFindUs} from './HomeToday';
import type {SocialPost} from './SocialArchive';
import type {ServiceCard} from '@/lib/service-data';
import './experiences.css';
export default function HomeExperience({featured=[],services=[]}:{featured?:SocialPost[];services?:ServiceCard[]}){
 const {t}=useGymLanguage();
 useEffect(()=>{if(location.hash==='#member')location.replace('/member')},[]);
 return <>
 <HomeCinema/>
 <section className="hp3-quick-actions"><div className="hp3-container">{[[CalendarDays,'/classes','FIND A CLASS','اختر حصتك','Your time. Your training.','بوقتك، وعلى طريقتك.'],[UserRound,'/coaches','FIND YOUR COACH','تعرّف على مدربك','Guidance that moves you.','متابعة تساعدك تتقدّم.'],[Dumbbell,'/member?tab=studio','BUILD A WORKOUT','صمّم تمرينك','Make every session yours.','كل حصة على مقاسك.'],[MapPin,'/contact','FIND US','موقعنا','Location, hours & directions.','الموقع والدوام والاتجاهات.']].map(([Icon,url,en,ar,desc,descAr])=>{const I=Icon as typeof Dumbbell;return <a key={url as string} href={url as string}><I size={24}/><div><h2>{t(en as string,ar as string)}</h2><p>{t(desc as string,descAr as string)}</p></div><ArrowUpRight size={19}/></a>})}</div></section><PricesTeaser/>
 {services.length>0&&<section className="hp3-container hp3-section hx-home-services"><div className="hx-home-head"><div><span className="hp3-kicker">{t('OUR SERVICES','خدماتنا')}</span><h2>{t('Everything under','كل شيء تحت')} <em>{t('one roof.','سقف واحد.')}</em></h2></div><a href="/services" className="hx-home-all">{t('All services','كل الخدمات')}<ArrowUpRight size={16}/></a></div><div className="hx-home-grid">{services.map(c=><ServiceTile key={c.slug} card={c}/>)}</div></section>}
 <HomeToday/>
 <section className="hp3-container hp3-section hp3-home-club" id="club"><div className="hp3-home-club-images"><img src="/images/display/pool-02.webp" width={2048} height={1365} loading="lazy" alt={t('The Hydrogen pool and relaxation space','مسبح هايدروجين ومساحة الاسترخاء')}/><img src="/images/facebook/622573390695999.jpg" width={1080} height={1920} loading="lazy" alt={t('The actual Pilates studio','استوديو البيلاتس الحقيقي')}/><a href="/club?tour=1"><span>{t('TAKE A LOOK AROUND','ألقِ نظرة حولك')}</span><ArrowUpRight size={26}/></a></div><div><span className="hp3-kicker">{t('ONE CLUB. A WORLD OF POSSIBILITIES.','نادٍ واحد وعالم من الإمكانات.')}</span><h2>{t('TRAIN HARD.','تدرّب بقوة.')}<br/>{t('LIVE WELL.','وعِش أفضل.')}</h2><p>{t('From the strength floor to the Pilates studio, from a rooftop swim to a moment at Hydrogen Lounge. Discover every side of your club.','من صالة القوة إلى استوديو البيلاتس، ومن السباحة على السطح إلى لحظة في هايدروجين لاونج. اكتشف كل جوانب ناديك.')}</p><div className="hp3-home-amenities">{[['Strength & cardio','قوة وكارديو'],['Pilates & cycling','بيلاتس ودراجات'],['Boxing & martial arts','ملاكمة وفنون قتالية'],['Pool & spa','مسبح وسبا'],['Hydro Rest','هايدرو ريست'],['Hydrogen Lounge','هايدروجين لاونج']].map(([en,ar])=><span key={en}><Check size={14}/>{t(en,ar)}</span>)}</div><a href="/club" className="hp3-button hp3-red">{t('Explore the club','استكشف النادي')}<ArrowUpRight size={18}/></a><small>{t('Ask the team about current service access and availability.','اسأل الفريق عن الدخول والتوفر الحالي للخدمات.')}</small></div></section>
 {featured.length>0&&<section className="hp3-container hp3-section hp3-home-community"><div className="hp3-heading-row"><div><span className="hp3-kicker">{t('LIFE AT HYDROGEN','الحياة في هايدروجين')}</span><h2>{t('THE PEOPLE.','الناس.')}<br/>{t('THE MOMENTS.','واللحظات.')}</h2></div></div><a className="hx-life" href="/services/events#archive"><span className="hx-life-photos" aria-hidden="true">{featured.slice(0,3).map(p=>{const m=p.media[0];return <img key={p.id} src={m.kind==='video'?m.poster:m.src} alt="" loading="lazy"/>})}</span><span className="hx-life-cta"><span><small>INSTAGRAM · FACEBOOK</small><strong>{t('See all our posts and events','شاهد كل منشوراتنا وفعالياتنا')}</strong></span><ArrowUpRight size={22}/></span></a></section>}
 <HomeFindUs/>
 </>
}
