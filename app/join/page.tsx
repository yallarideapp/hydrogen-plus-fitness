import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import VisitForm from '@/components/gym/VisitForm';
export const metadata:Metadata={title:'Send us a message | Hydrogen Plus Fitness',description:'Send Hydrogen Plus Fitness & Spa in Irbid a question and the team calls you back.'};
export default async function JoinPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const p=await searchParams;const str=(key:string)=>typeof p[key]==='string'?p[key] as string:'';return <SiteShell active="join"><VisitForm initialKind={str('kind')} initialInterest={str('interest')} initialDate={str('date')} initialMessage={str('message')}/></SiteShell>}
