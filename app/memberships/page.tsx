import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import MembershipAdvisor from '@/components/gym/MembershipAdvisor';
export const metadata:Metadata={title:'Find your membership | Hydrogen Plus Fitness',description:'Use the membership finder to explore your goals, training preferences, weekly routine and services, then ask Hydrogen for a current membership quote.'};
export default function MembershipsPage(){return <SiteShell active="memberships"><MembershipAdvisor/></SiteShell>}
