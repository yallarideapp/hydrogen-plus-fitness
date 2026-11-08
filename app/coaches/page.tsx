import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import CoachesPage from '@/components/gym/CoachesPage';

export const metadata: Metadata = { title: 'Coaches | Hydrogen Plus Fitness & Spa, Irbid', description: "Meet the Hydrogen Plus Fitness coaches named on the club’s timetable and posts, and ask to train with them.", alternates: { canonical: '/coaches' }, openGraph: { images: [{ url: '/images/og/coaches.jpg', width: 1200, height: 630 }] } };
export default function Page() { return <SiteShell active="coaches"><CoachesPage /></SiteShell>; }
