import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import ServicePage from '@/components/gym/ServicePage';
import { serviceBySlug } from '@/lib/services';
import { postsForService, relatedCards } from '@/lib/service-data';

const service = serviceBySlug('offers')!;
export const metadata: Metadata = { title: `${service.name[0]} | Hydrogen Plus Fitness & Spa, Irbid`, description: service.intro[0], alternates: { canonical: service.path }, openGraph: { title: `${service.name[0]} · Hydrogen Plus Fitness`, description: service.intro[0], images: [{ url: `/images/og/${service.slug}.jpg`, width: 1200, height: 630 }] } };
export default function Page() { return <SiteShell active="offers"><ServicePage service={service} posts={postsForService('offers')} related={relatedCards(service)} /></SiteShell>; }
