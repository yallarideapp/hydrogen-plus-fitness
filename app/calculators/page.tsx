import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import Calculators from '@/components/gym/Calculators';

export const metadata: Metadata = { title: 'Fitness calculators | Hydrogen Plus Fitness & Spa, Irbid', description: "Free BMI, daily calorie, macro, one-rep max, heart-rate zone, water and body-fat calculators from Hydrogen Plus Fitness.", alternates: { canonical: '/calculators' }, openGraph: { images: [{ url: '/images/og/calculators.jpg', width: 1200, height: 630 }] } };
export default function Page() { return <SiteShell active="calculators"><Calculators /></SiteShell>; }
