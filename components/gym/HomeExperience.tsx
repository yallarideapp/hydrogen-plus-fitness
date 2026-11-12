'use client';
import {useEffect} from 'react';
import {ArrowDown,ArrowUpRight,CalendarDays,Dumbbell,MapPin,UserRound} from 'lucide-react';
import {useGymLanguage} from './SiteShell';
import {PricesTeaser} from './Plans';
import {HomeToday,HomeFindUs} from './HomeToday';
import type {SocialPost} from './SocialArchive';
import type {ServiceCard} from '@/lib/service-data';
import './experiences.css';
export default function HomeExperience({featured=[],services=[]}:{featured?:SocialPost[];services?:ServiceCard[]}){
 const {t,lang}=useGymLanguage();
 useEffect(()=>{if(location.hash==='#member')location.replace('/member')},[]);
 return <>
 <section className="hp3-home-hero"><div className="hp3-container hp3-home-hero-grid"><div className="hp3-home-hero-copy"><span className="hp3-kicker">{t('HYDROGEN PLUS FITNESS & SPA · IRBID','هايدروجين بلس فتنس آند سبا · إربد')}</span><h1>{t('BUILT FOR','هنا تُصنع')}<br/><em>{t('MORE.','القوة.')}</em></h1><p>{t('More strength. More movement. More life. Find your place to train, recharge and become the version of you that keeps moving forward.','قوة أكبر، حركة أكثر، وحياة أفضل. هنا تتمرّن وتستعيد طاقتك، وتبدأ رحلتك نحو نسخة أقوى من نفسك.')}</p><div className="hp3-button-row"><a href="/prices" className="hp3-button hp3-red">{t('Plans & prices','الأسعار والاشتراكات')}<ArrowUpRight size={18}/></a><a href="/classes" className="hp3-text-link">{t('Find a class','اختر حصتك')}<ArrowUpRight size={16}/></a></div><div className="hp3-hero-foot"><span>{t('STRENGTH','القوة')}</span><b>+</b><span>{t('MOVEMENT','الحركة')}</span><b>+</b><span>{t('RECOVERY','التعافي')}</span></div></div><div className="hp3-hero-photos"><div className="hp3-hero-main-photo"><img src="/images/display/gym-03.webp" width={2048} height={1365} alt={t('Inside the real Hydrogen Plus Fitness gym','داخل نادي هايدروجين بلس الحقيقي')} fetchPriority="high"/><span className="hp3-image-label">{t('YOUR SPACE TO BECOME.','مساحتك لتكون أقوى.')}</span><span className="hp3-hero-mark">H<span>+</span></span></div><a href="/club?space=pool" className="hp3-hero-pool"><img src="/images/display/pool-01.webp" width={2048} height={1365} alt={t('Hydrogen rooftop pool at sunset','مسبح هايدروجين على السطح وقت الغروب')}/><span>{t('TRAIN. THEN RECHARGE.','تمرّن… ثم استرخِ.')}<ArrowUpRight size={20}/></span></a><a className="hp3-hero-tour" href="/club?tour=1"><span><MapPin size={19}/><b>{t('STEP INSIDE','جولة في النادي')}</b></span><strong>{t('Your club,','ناديك،')}<br/>{t('from every angle.','من كل زاوية.')}</strong><span className="hp3-hero-tour-link">{t('Explore the club','استكشف النادي')}<ArrowUpRight size={16}/></span></a></div></div><div className="hp3-hero-scroll"><ArrowDown size={14}/><span>{t('FIND YOUR KIND OF STRONG','اختر طريقك نحو القوة')}</span></div></section>
 <section className="hp3-quick-actions"><div className="hp3-container">{[[CalendarDays,'/classes','FIND A CLASS','اختر حصتك','Your time. Your training.','بوقتك، وعلى طريقتك.'],[UserRound,'/coaches','FIND YOUR COACH','تعرّف على مدربك','Guidance that moves you.','متابعة تساعدك تتقدّم.'],[Dumbbell,'/member?tab=studio','BUILD A WORKOUT','صمّم تمرينك','Make every session yours.','كل حصة على مقاسك.'],[MapPin,'/contact','FIND US','موقعنا','Location, hours & directions.','الموقع والدوام والاتجاهات.']].map(([Icon,url,en,ar,desc,descAr])=>{const I=Icon as typeof Dumbbell;return <a key={url as string} href={url as string}><I size={24}/><div><h2>{t(en as string,ar as string)}</h2><p>{t(desc as string,descAr as string)}</p></div><ArrowUpRight size={19}/></a>})}</div></section><PricesTeaser/>
 <HomeToday/>
 <HomeFindUs/>
 </>
}
