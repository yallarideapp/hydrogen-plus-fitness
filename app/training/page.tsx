import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import MovedPage from '@/components/gym/MovedPage';

// Personal training now lives on the Coaches page.
export const metadata: Metadata = { title: 'Coaches & personal training | Hydrogen Plus Fitness', robots: { index: false }, alternates: { canonical: '/coaches' } };
export default function TrainingPage() {
  return <SiteShell active="coaches"><MovedPage from="/training" to="/coaches#personal-training" en="Coaches & personal training" ar="المدربون والتدريب الشخصي" /></SiteShell>;
}
