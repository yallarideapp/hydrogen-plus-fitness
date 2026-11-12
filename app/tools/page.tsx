import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import MovedPage from '@/components/gym/MovedPage';

// The workout studio now lives inside My training (tab "Build a workout").
export const metadata: Metadata = { title: 'Build a workout | Hydrogen Plus Fitness', robots: { index: false }, alternates: { canonical: '/member' } };
export default function ToolsPage() {
  return <SiteShell active="member"><MovedPage from="/tools" to="/member?tab=studio" en="My training → Build a workout" ar="تدريبي ← ابنِ تمرينك" /></SiteShell>;
}
