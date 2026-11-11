import type {Metadata} from 'next';
import SiteShell from '@/components/gym/SiteShell';
import {PricesPage} from '@/components/gym/Plans';
export const metadata:Metadata={title:'Plans & prices | Hydrogen Plus Fitness',description:'All Hydrogen Plus plans and prices in one place: men’s gym, ladies’ club, boxing, classes, Pilates, pool & spa, swimming, kids, personal training and meal plans.',openGraph:{images:['/images/og/home.jpg']}};
export default function Prices(){return <SiteShell active="prices"><PricesPage/></SiteShell>}
