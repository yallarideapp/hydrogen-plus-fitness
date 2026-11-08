import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import VisitForm from '@/components/gym/VisitForm';
export const metadata:Metadata={title:'Plan your visit | Hydrogen Plus Fitness',description:'Plan a club tour, enquire about a membership, training or a day pass, and choose your preferred visit date.'};
export default async function JoinPage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const p=await searchParams;const str=(key:string)=>typeof p[key]==='string'?p[key] as string:'';return <SiteShell active="join"><VisitForm initialKind={str('kind')||'tour'} initialInterest={str('interest')} initialDate={str('date')} initialMessage={str('message')}/></SiteShell>}
