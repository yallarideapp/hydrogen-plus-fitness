import type { Metadata } from 'next';
import SiteShell from '@/components/gym/SiteShell';
import ServicePage from '@/components/gym/ServicePage';
import { serviceBySlug } from '@/lib/services';
import { postsForService, relatedCards } from '@/lib/service-data';

const service = serviceBySlug('pool-spa')!;
export const metadata: Metadata = { title: `${service.name[0]} | Hydrogen Plus Fitness & Spa, Irbid`, description: service.intro[0], alternates: { canonical: service.path }, openGraph: { title: `${service.name[0]} · Hydrogen Plus Fitness`, description: service.intro[0], images: [{ url: `/images/og/${service.slug}.jpg`, width: 1200, height: 630 }] } };
export default function Page() { return <SiteShell active="services"><ServicePage service={service} posts={[...postsForService('pool-spa'), ...postsForService('swimming-academy')].filter((p, i, a) => a.findIndex((x) => x.code === p.code) === i)} related={relatedCards(service)} /></SiteShell>; }
