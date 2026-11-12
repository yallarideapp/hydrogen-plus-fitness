import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import MovedPage from '@/components/gym/MovedPage';

// The Instagram & Facebook archive is now part of the Events & community page.
export const metadata: Metadata = { title: 'Events & community | Hydrogen Plus Fitness', robots: { index: false }, alternates: { canonical: '/services/events' } };
export default function CommunityPage() {
  return <SiteShell active="services"><MovedPage from="/community" to="/services/events#archive" en="Events & community" ar="الفعاليات والمجتمع" /></SiteShell>;
}
