import instagram from './instagram-posts.json';
import serviceMap from './service-posts.json';
import { services, newsPage, serviceBySlug, type Service } from './services';

export type ServiceMedia = { src: string; thumb: string; width: number; height: number; kind: 'image' | 'video'; poster?: string; posterThumb?: string };
export type ServicePost = { id: string; code: string; url: string; date: string; caption: string; kind: string; media: ServiceMedia[]; collab?: string[] };
export type ServiceCard = Pick<Service, 'slug' | 'path' | 'icon' | 'name' | 'kicker' | 'intro' | 'hero'> & { posts: number; videos: number };

type RawMedia = { src: string; width: number; height: number; kind: 'image' | 'video'; poster?: string };
type RawPost = { id: string; url: string; publishedAt?: string; caption: string; kind: string; media: RawMedia[]; collaborators?: string[] };

const thumbOf = (src?: string) => (src && /^\/images\/(archive|facebook)\/.+\.jpg$/.test(src) ? src.replace(/^\/images\/(archive|facebook)\//, '/images/thumbs/').replace(/\.jpg$/, '.webp') : src ?? '');

const all: ServicePost[] = (instagram as RawPost[]).map((p) => ({
  id: p.id, code: p.id.replace(/^ig-/, ''), url: p.url, date: (p.publishedAt ?? '').slice(0, 10), caption: p.caption, kind: p.kind,
  collab: p.collaborators?.filter((c) => c !== 'hydrogenplusfitness'),
  media: p.media.map((m) => ({ src: m.src, thumb: thumbOf(m.kind === 'video' ? m.poster : m.src), width: m.width, height: m.height, kind: m.kind, ...(m.poster ? { poster: m.poster, posterThumb: thumbOf(m.poster) } : {}) })),
}));
const byId = new Map(all.map((p) => [p.id, p]));
const map = serviceMap as Record<string, string[]>;

export function postsForService(slug: string): ServicePost[] {
  const service = serviceBySlug(slug);
  const ids = slug === 'offers' ? (service?.timeline ?? []).map((t) => 'ig-' + t.source.split('/p/')[1]?.replace('/', '')) : map[slug] ?? [];
  const featured = (service?.featured ?? []).map((c) => 'ig-' + c);
  const ordered = [...featured.filter((id) => ids.includes(id) || byId.has(id)), ...ids.filter((id) => !featured.includes(id))];
  const seen = new Set<string>();
  return ordered.flatMap((id) => { const p = byId.get(id); if (!p || seen.has(id)) return []; seen.add(id); return [p]; });
}

export function serviceCards(): ServiceCard[] {
  return services.map((s) => {
    const posts = postsForService(s.slug);
    return { slug: s.slug, path: s.path, icon: s.icon, name: s.name, kicker: s.kicker, intro: s.intro, hero: s.hero, posts: posts.length, videos: posts.filter((p) => p.media.some((m) => m.kind === 'video')).length };
  });
}

export function relatedCards(service: Service): ServiceCard[] {
  const cards = serviceCards();
  return service.related.flatMap((slug) => cards.filter((c) => c.slug === slug));
}

export const latestPosts = (n: number) => [...all].sort((a, b) => b.date.localeCompare(a.date)).filter((p) => p.media.length).slice(0, n);
export const instagramCount = all.length;
export { services, newsPage };
