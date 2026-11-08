import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import ContactPage from '@/components/gym/ContactPage';

export const metadata: Metadata = { title: 'Contact & location | Hydrogen Plus Fitness & Spa, Irbid', description: "Call 079 215 1000 or 079 214 1000, get directions to Al-Husn Road opposite Granada College, Irbid, and see live opening hours.", alternates: { canonical: '/contact' } };
export default function Page() { return <SiteShell active="contact"><ContactPage /></SiteShell>; }
