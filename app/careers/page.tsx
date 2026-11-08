import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import CareersPage from '@/components/gym/CareersPage';

export const metadata: Metadata = { title: 'Careers | Hydrogen Plus Fitness & Spa, Irbid', description: "Work at Hydrogen Plus Fitness & Spa in Irbid — coaching and club roles.", alternates: { canonical: '/careers' } };
export default function Page() { return <SiteShell active="careers"><CareersPage /></SiteShell>; }
