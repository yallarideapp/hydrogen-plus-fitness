import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import MovedPage from '@/components/gym/MovedPage';

// Swimming lessons are now part of the Pool, spa & swimming page.
export const metadata: Metadata = { title: 'Pool, spa & swimming | Hydrogen Plus Fitness', robots: { index: false }, alternates: { canonical: '/services/pool-spa' } };
export default function Page() {
  return <SiteShell active="services"><MovedPage from="/services/swimming-academy" to="/services/pool-spa" en="Pool, spa & swimming" ar="المسبح والسبا والسباحة" /></SiteShell>;
}
