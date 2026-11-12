'use client';
// The Instagram & Facebook archive, shown at the bottom of the Events & community page.
import SocialArchive from './SocialArchive';
import { useGymLanguage } from './SiteShell';
import type { SocialPost } from './SocialArchive';

export default function EventsArchive({ posts }: { posts: SocialPost[] }) {
  const { t, lang } = useGymLanguage();
  return (
    <section className="hx-events-archive" id="archive" aria-label={t('Instagram & Facebook', 'إنستغرام وفيسبوك')}>
      <div className="hp-community-shell"><SocialArchive posts={posts} lang={lang} /></div>
    </section>
  );
}
