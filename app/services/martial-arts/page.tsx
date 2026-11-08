import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import ServicePage from '@/components/gym/ServicePage';
import { serviceBySlug } from '@/lib/services';
import { postsForService, relatedCards } from '@/lib/service-data';

const service = serviceBySlug('martial-arts')!;
export const metadata: Metadata = { title: `${service.name[0]} | Hydrogen Plus Fitness & Spa, Irbid`, description: service.intro[0], alternates: { canonical: service.path }, openGraph: { title: `${service.name[0]} · Hydrogen Plus Fitness`, description: service.intro[0], images: [service.hero.src] } };
export default function Page() { return <SiteShell active="services"><ServicePage service={service} posts={postsForService('martial-arts')} related={relatedCards(service)} /></SiteShell>; }
