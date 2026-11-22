'use client';

// My training, arranged like an account page: a compact head (days left on the plan, three numbers at a glance),
// then three tabs. Membership = the plan card and requests. Workouts = the month log (logged workouts and attended
// classes), then the workout builder, my classes and the weekly goal as fold-out sections. Body = weight and the fitness calculators.
// The tools themselves are the same ones as before (MyMembership, WorkoutStudio, TrainingJourney, the class plan);
// this file loads the member's data once and places them. Old links (?tab=studio, ?tab=journal, ?tab=plan,
// ?tab=goals) still land on the right spot.

import {useCallback,useEffect,useRef,useState,type KeyboardEvent,type ReactNode} from 'react';
import {ArrowUpRight,BadgeCheck,CalendarDays,CalendarX,Check,ChevronDown,Clock3,Dumbbell,Goal,LoaderCircle,Scale,Timer,UserRound} from 'lucide-react';
import WorkoutStudio from './WorkoutStudio';
import {useGymLanguage} from './SiteShell';
import {WorkoutLog,WeightLog,RequestList,DataControls,ammanToday,arCount,fmtDate,fmtNum,weekStartOf,type MemberData} from './MemberArea';
import TrainingJourney from './TrainingJourney';
import {MyMembership,fetchSubscription,daysBetween,type Sub} from './Plans';
import {InstallApp} from './SiteExtras';
import {usePlans,useSchedule} from '@/lib/admin/overrides';
import MyClasses,{classesSummary,classKey,clock,type Session} from './MyClasses';
import {MEMBER_EVENT} from '@/lib/member-events';
import './experiences.css';
import './account.css';

type SavedGoal={focus:string;weeklyTarget:number};
type TabId='membership'|'workouts'|'body';
type MoreId='studio'|'plan'|'goals';
type Member={status:'loading'|'ready'|'signedOut'|'error';data:MemberData|null};
type Subs={kind:'loading'|'offline'|'load'}|{kind:'ok';subscription:Sub|null;history:Sub[]};

const TABS:[TabId,string,string,typeof Scale][]=[['membership','Membership','اشتراكي',BadgeCheck],['workouts','Workouts','تماريني',Dumbbell],['body','Body','جسمي',Scale]];
// Where each link lands, including the names the five old tabs had.
const LAND:Record<string,[TabId,MoreId?]>={membership:['membership'],workouts:['workouts'],journal:['workouts'],studio:['workouts','studio'],plan:['workouts','plan'],goals:['workouts','goals'],body:['body']};
const RING=2*Math.PI*46;

export default function MemberExperience(){
 const {lang,t}=useGymLanguage();const cats=usePlans();
 const [tab,setTab]=useState<TabId>('membership');const [seen,setSeen]=useState<TabId[]>(['membership']);
 const [today,setToday]=useState('');// set after mount: the static page is built on another day
 const [member,setMember]=useState<Member>({status:'loading',data:null});const [subs,setSubs]=useState<Subs>({kind:'loading'});
 const [sessions,setSessions]=useState<Session[]>([]);const [planState,setPlanState]=useState<'loading'|'ready'|'guest'|'error'>('loading');
 const [goal,setGoal]=useState<SavedGoal|null>(null);
 const [open,setOpen]=useState<Record<MoreId,boolean>>({studio:false,plan:false,goals:false});const [built,setBuilt]=useState<MoreId[]>([]);
 const jump=useRef<string>('');

 const loadMember=useCallback(async()=>{try{const r=await fetch('/api/member',{cache:'no-store'});if(r.status===401){setMember({status:'signedOut',data:null});return}if(!r.ok)throw new Error();const p=await r.json() as MemberData;if(!p.user){setMember({status:'signedOut',data:null});return}setMember({status:'ready',data:{user:p.user,workouts:p.workouts??[],measurements:p.measurements??[],requests:p.requests??[]}})}catch{setMember(m=>m.data?m:{status:'error',data:null})}},[]);
 const loadSubs=useCallback(async()=>{const r=await fetchSubscription();setSubs(r.kind==='ok'?{kind:'ok',subscription:r.data.subscription,history:r.data.history??[]}:{kind:r.kind})},[]);
 const loadPlan=useCallback(async()=>{try{const r=await fetch('/api/planner',{cache:'no-store'});if(r.status===401){setPlanState('guest');return}if(!r.ok)throw new Error();const d=await r.json() as {sessions:Session[]};setSessions(d.sessions??[]);setPlanState('ready')}catch{setPlanState('error')}},[]);
 const loadGoal=useCallback(async()=>{try{const r=await fetch('/api/goals',{cache:'no-store'});if(!r.ok)return;const d=await r.json() as {goal:SavedGoal|null};setGoal(d.goal??null)}catch{/* the goal is only a hint in the head */}},[]);

 const show=useCallback((id:TabId,more?:MoreId)=>{setTab(id);setSeen(s=>s.includes(id)?s:[...s,id]);if(more){setOpen(o=>({...o,[more]:true}));setBuilt(b=>b.includes(more)?b:[...b,more]);jump.current=more}},[]);
 useEffect(()=>{
  setToday(ammanToday());
  const hit=LAND[new URLSearchParams(location.search).get('tab')??'']??LAND[location.hash.slice(1)];if(hit)show(hit[0],hit[1]);
  const all=()=>{void loadMember();void loadSubs();void loadPlan();void loadGoal()};all();
  window.addEventListener(MEMBER_EVENT,all);return()=>window.removeEventListener(MEMBER_EVENT,all);
 },[show,loadMember,loadSubs,loadPlan,loadGoal]);
 // After a link opened one of the fold-out sections, bring it into view — once the log above it has loaded, or the
 // section would be pushed back down the page.
 const settled=member.status!=='loading'&&subs.kind!=='loading';// the head grows too when the plan arrives
 useEffect(()=>{if(!jump.current||!settled)return;const id=jump.current;jump.current='';requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({block:'start'}))},[tab,open,settled]);

 function pick(id:TabId,more?:MoreId){show(id,more);const u=new URL(location.href);u.searchParams.set('tab',more??id);u.hash='';history.replaceState(null,'',u)}
 function onTabKey(e:KeyboardEvent<HTMLDivElement>){const i=TABS.findIndex(x=>x[0]===tab);const step=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;const next=e.key==='Home'?0:e.key==='End'?TABS.length-1:step?(i+(lang==='ar'?-step:step)+TABS.length)%TABS.length:-1;if(next<0)return;e.preventDefault();pick(TABS[next][0]);document.getElementById('ac-tab-'+TABS[next][0])?.focus()}

 // ---- the head: what the plan says today ----
 const sub=subs.kind==='ok'?subs.subscription:null;const past=subs.kind==='ok'?subs.history:[];
 const planLabel=(s:Sub)=>{for(const c of cats)for(const p of c.plans)if(`${c.name[0]} · ${p.label[0]}`===s.planName)return `${t(c.name[0],c.name[1])} · ${t(p.label[0],p.label[1])}`;return s.planName};
 const day=(d:string)=>fmtDate(d,lang,{day:'numeric',month:'long',year:'numeric'});
 const left=today&&sub?.status==='active'&&sub.endDate?Math.max(0,daysBetween(today,sub.endDate)+1):null;
 const total=sub?.endDate?daysBetween(sub.startDate,sub.endDate)+1:0;
 const soon=left!==null&&left<=7&&!(sub?.days&&!sub?.months);
 const ended=today&&subs.kind==='ok'&&!sub?past.find(h=>h.status==='active'&&!!h.endDate&&h.endDate<today):undefined;
 const since=past.filter(h=>h.status==='active').map(h=>h.startDate).sort()[0];
 const pricesLink=(s?:Sub|null)=>{const c=s&&cats.find(x=>x.name[0]===s.categoryName);return '/prices'+(c?'#'+c.id:'')};
 const ring=!today||subs.kind!=='ok'?{k:'',n:'—' as ReactNode,l:t('My plan','اشتراكي'),f:0}
  :left!==null?{k:soon?' is-soon':' is-active',n:fmtNum(left,lang),l:lang==='ar'?(left===1?'يوم متبقٍ':left===2?'يومان متبقيان':left<=10?'أيام متبقية':'يوماً متبقياً'):left===1?'day left':'days left',f:total?Math.min(1,left/total):1}
  :sub?.status==='active'?{k:' is-active',n:<Check size={44} strokeWidth={2.4}/>,l:t('Active','فعّال'),f:1}
  :sub?.status==='pending'?{k:' is-soon',n:<Clock3 size={40} strokeWidth={1.8}/>,l:t('Waiting for payment','بانتظار الدفع'),f:0}
  :ended?{k:' is-ended',n:<CalendarX size={40} strokeWidth={1.8}/>,l:t('Plan ended','انتهى الاشتراك'),f:0}
  :{k:'',n:'—',l:t('No plan yet','لا يوجد اشتراك'),f:0};
 const planLine=!today||subs.kind==='loading'?t('Loading your membership…','جارٍ تحميل اشتراكك…')
  :subs.kind==='offline'?t('Your membership is managed at reception.','اشتراكك يُدار من الاستقبال.')
  :subs.kind==='load'?t('We couldn’t load your membership.','تعذّر تحميل اشتراكك.')
  :sub?.status==='active'?(sub.endDate?t(`${planLabel(sub)} · until ${day(sub.endDate)}`,`${planLabel(sub)} · حتى ${day(sub.endDate)}`):planLabel(sub))
  :sub?.status==='pending'?t(`${planLabel(sub)} · starts once the club confirms`,`${planLabel(sub)} · يبدأ عند تأكيد النادي`)
  :ended?t(`Your plan ended on ${day(ended.endDate!)}.`,`انتهى اشتراكك في ${day(ended.endDate!)}.`)
  :t('Choose a plan to see how many days you have left.','اختر اشتراكك لتعرف عدد الأيام المتبقية.');
 const action=!today||subs.kind!=='ok'?null
  :(sub?.status==='active'&&soon)||ended?{href:pricesLink(sub??ended),label:t('Renew my plan','جدّد الاشتراك')}
  :!sub?{href:'/prices',label:t('Choose a plan','اختر اشتراكك')}:null;

 // ---- three numbers at a glance ----
 const data=member.data;const workouts=data?.workouts??[];
 // Attended classes count as workouts here, in the month view and toward the weekly goal.
 const attended=sessions.filter(s=>s.status==='completed');
 const {classes:timetable}=useSchedule();
 const classLog=attended.map(s=>{const c=timetable.find(x=>classKey(x)===s.classKey);return {id:s.id,date:s.scheduledDate,time:s.scheduledTime,name:c?t(c.name,c.ar):s.className,detail:[clock(s.scheduledTime,lang),s.coach&&s.coach!=='—'?s.coach:''].filter(Boolean).join(' · ')}});
 const monthCount=today?workouts.filter(w=>w.date.slice(0,7)===today.slice(0,7)).length+attended.filter(s=>s.scheduledDate.slice(0,7)===today.slice(0,7)).length:0;
 const weekCount=today?[...workouts.map(w=>w.date),...attended.map(s=>s.scheduledDate)].filter(d=>d>=weekStartOf(today)&&d<=today).length:0;
 const weight=data?.measurements.length?[...data.measurements].sort((a,b)=>b.date.localeCompare(a.date))[0]:null;

 const needsAccount=(node:()=>ReactNode)=>member.status==='ready'?node()
  :member.status==='loading'?<p className="ac-loading"><LoaderCircle size={20} className="ac-spin"/>{t('Getting your space ready…','نجهّز مساحتك…')}</p>
  :member.status==='signedOut'?<div className="ac-card ac-signin"><UserRound size={30}/><h3>{t('Your next chapter starts here.','خطوتك القادمة تبدأ هنا.')}</h3><p>{t('Sign in to save your workouts and track your weight over time. A website account does not activate a gym membership.','سجّل الدخول لحفظ تمارينك ومتابعة وزنك. إنشاء حساب في الموقع لا يفعّل اشتراك النادي.')}</p><a className="hp3-button hp3-red" href="/signin-with-chatgpt?return_to=%2Fmember" target="_top">{t('Sign in','تسجيل الدخول')}<ArrowUpRight size={17}/></a></div>
  :<div className="ac-card ac-signin"><p role="alert">{t('We couldn’t load your member space. Please try again.','تعذّر تحميل مساحتك. يُرجى المحاولة مرة أخرى.')}</p><button type="button" className="hp3-button" onClick={()=>void loadMember()}>{t('Try again','إعادة المحاولة')}</button></div>;
 const signedOut=()=>setMember({status:'signedOut',data:null});
 const more=(id:MoreId,Icon:typeof Scale,title:string,meta:string,body:()=>ReactNode,flush=false)=><details className="ac-more" id={id} open={open[id]} onToggle={e=>{const o=e.currentTarget.open;setOpen(x=>x[id]===o?x:{...x,[id]:o});if(o)setBuilt(b=>b.includes(id)?b:[...b,id])}}><summary><Icon size={19}/><span>{title}</span>{meta&&<small>{meta}</small>}<ChevronDown size={18} className="ac-more-chev"/></summary>{built.includes(id)&&<div className={'ac-more-body'+(flush?' is-flush':'')}>{body()}</div>}</details>;

 return <div className="hp3-container ac-page">
  <section className="ac-head">
   <button type="button" className={'ac-ring'+ring.k} onClick={()=>pick('membership')} aria-label={t('My membership','اشتراكي')}>
    <svg viewBox="0 0 100 100" aria-hidden="true"><circle className="ac-ring-track" cx="50" cy="50" r="46"/><circle className="ac-ring-arc" cx="50" cy="50" r="46" strokeDasharray={RING} strokeDashoffset={RING*(1-ring.f)}/></svg>
    <b>{ring.n}</b><span>{ring.l}</span>
   </button>
   <div className="ac-id">
    <span className="hp3-kicker">MY HYDROGEN</span>
    <h1>{t('MY TRAINING','تدريبي')}</h1>
    <p className="ac-plan">{planLine}</p>
    {since&&<p className="ac-since">{t('Member since','عضو منذ')} {fmtDate(since,lang,{month:'long',year:'numeric'})}</p>}
    {action&&<div className="ac-actions"><a className="hp3-button hp3-red" href={action.href}>{action.label}<ArrowUpRight size={16}/></a></div>}
   </div>
   <div className="ac-glance">
    <button type="button" onClick={()=>pick('workouts')}><b>{member.status==='ready'&&today?fmtNum(monthCount,lang):'—'}</b><span>{t('Workouts this month','تمارين هذا الشهر')}</span></button>
    <button type="button" onClick={()=>pick('body')}><b>{weight?<>{fmtNum(Number(weight.weight),lang,1)} <small>{t('kg','كغ')}</small></>:'—'}</b><span>{t('Weight','الوزن')}</span></button>
    <button type="button" onClick={()=>pick('workouts','goals')}><b>{goal&&member.status==='ready'&&today?t(`${weekCount} of ${goal.weeklyTarget}`,`${fmtNum(weekCount,'ar')} من ${fmtNum(goal.weeklyTarget,'ar')}`):'—'}</b><span>{t('This week’s goal','هدف هذا الأسبوع')}</span></button>
   </div>
  </section>

  <div className="ac-tabs" role="tablist" aria-label={t('My training sections','أقسام تدريبي')} onKeyDown={onTabKey}>{TABS.map(([id,en,ar,Icon])=><button key={id} type="button" role="tab" id={'ac-tab-'+id} aria-controls={'ac-panel-'+id} aria-selected={tab===id} tabIndex={tab===id?0:-1} onClick={()=>pick(id)}><Icon size={18}/>{t(en,ar)}</button>)}</div>

  <section className="ac-panel" id="ac-panel-membership" role="tabpanel" aria-labelledby="ac-tab-membership" hidden={tab!=='membership'}>
   <div className="ac-member-layout">
    <MyMembership/>
    <aside className="ac-side">
     {member.status==='ready'&&data&&<RequestList lang={lang} requests={data.requests}/>}
     <section className="ac-card ac-help"><h3>{t('More from your membership','المزيد لاشتراكك')}</h3><p className="ac-muted">{t('Questions, renewals, freeze enquiries or a change of plans?','أسئلة أو تجديد أو استفسار عن التجميد أو تغيير خطتك؟')}</p><a className="hp3-text-link" href="/support">{t('Visit the help centre','زر مركز المساعدة')}<ArrowUpRight size={16}/></a></section>
    </aside>
   </div>
  </section>

  {seen.includes('workouts')&&<section className="ac-panel" id="ac-panel-workouts" role="tabpanel" aria-labelledby="ac-tab-workouts" hidden={tab!=='workouts'}>
   {needsAccount(()=><WorkoutLog lang={lang} workouts={workouts} classes={classLog} onSignedOut={signedOut}/>)}
   {more('studio',Timer,t('Build your next workout','ابنِ تمرينك القادم'),t('Exercises, sets and timers','تمارين ومجموعات ومؤقّت'),()=><WorkoutStudio/>)}
   {more('plan',CalendarDays,t('My classes','حصصي'),planState==='ready'?classesSummary(sessions,today,lang):'',()=><MyClasses lang={lang} today={today} sessions={sessions} state={planState} onRetry={()=>void loadPlan()}/>)}
   {more('goals',Goal,t('My weekly goal','هدفي الأسبوعي'),goal?(lang==='ar'?arCount(goal.weeklyTarget,'جلسة واحدة أسبوعياً','جلستان أسبوعياً','جلسات أسبوعياً','جلسة أسبوعياً'):`${goal.weeklyTarget} a week`):t('Not set yet','لم يُحدَّد بعد'),()=><TrainingJourney returnTo="/member?tab=goals"/>,true)}
  </section>}

  {seen.includes('body')&&<section className="ac-panel" id="ac-panel-body" role="tabpanel" aria-labelledby="ac-tab-body" hidden={tab!=='body'}>
   <div className="ac-body-layout">
    {needsAccount(()=><WeightLog lang={lang} measurements={data?.measurements??[]} onSignedOut={signedOut}/>)}
    <section className="ac-card ac-numbers"><h3>{t('My numbers','أرقامي')}</h3><p className="ac-muted">{t('Work out your BMI, body-fat reading, daily calories and heart-rate zones with the fitness calculators.','احسب مؤشر كتلة جسمك وقراءة الدهون وسعراتك اليومية ومناطق نبض قلبك بحاسبات اللياقة.')}</p><a className="hp3-text-link" href="/calculators">{t('Open the fitness calculators','افتح حاسبات اللياقة')}<ArrowUpRight size={16}/></a></section>
   </div>
  </section>}

  <InstallApp t={t} className="ac-install"/>
  <DataControls lang={lang} user={data?.user??null}/>
 </div>
}
