import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import ServicesIndex from '@/components/gym/ServicesIndex';
import { serviceCards, instagramCount } from '@/lib/service-data';

export const metadata: Metadata = {
  title: 'Services | Hydrogen Plus Fitness & Spa, Irbid',
  description: 'Gym floor, ladies’ club, group classes, reformer Pilates, boxing & martial arts, rooftop pool & spa, swimming lessons, kids’ programmes, personal training, Hydro Rest nutrition, Hydrogen Lounge and events.',
  alternates: { canonical: '/services' },
};
export default function ServicesPage() { return <SiteShell active="services"><ServicesIndex cards={serviceCards()} total={instagramCount} /></SiteShell>; }
