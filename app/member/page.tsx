import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import MemberExperience from '@/components/gym/MemberExperience';
export const metadata:Metadata={title:'My Hydrogen | Hydrogen Plus Fitness',description:'Your training journal, saved class plan, progress records, private goals and membership enquiries in one place.',robots:{index:false,follow:false}};
export default function MemberPage(){return <SiteShell active="member"><MemberExperience/></SiteShell>}
