import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import HelpCentre from '@/components/gym/HelpCentre';

export const metadata:Metadata={
 title:'Help & membership support | Hydrogen Plus Fitness',
 description:'Find answers about visiting Hydrogen Plus Fitness in Irbid, classes, membership enquiries and your account, or contact the club for help.',
 alternates:{canonical:'/support'},
};

export default function SupportPage(){return <SiteShell active="support"><HelpCentre/></SiteShell>}
