import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import VisitForm from '@/components/gym/VisitForm';
export const metadata:Metadata={title:'Book a free visit | Hydrogen Plus Fitness',description:'Book a free visit to Hydrogen Plus Fitness & Spa in Irbid: pick a day, leave your number and the team calls you to confirm.'};
export default async function JoinPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const p=await searchParams;const str=(key:string)=>typeof p[key]==='string'?p[key] as string:'';return <SiteShell active="join"><VisitForm initialKind={str('kind')} initialInterest={str('interest')} initialDate={str('date')} initialMessage={str('message')}/></SiteShell>}
