'use client';
// Old address → new place. Works on GitHub Pages (base path) and on the real server.
import { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useGymLanguage } from './SiteShell';

export default function MovedPage({ from, to, en, ar }: { from: string; to: string; en: string; ar: string }) {
  const { t } = useGymLanguage();
  const target = () => {
    const base = location.pathname.replace(new RegExp(`${from}/?$`), '');
    const [path, rest = ''] = to.split(/(?=[?#])/);
    const slash = location.hostname.endsWith('github.io') ? '/' : '';
    return `${base}${path}${slash}${rest}`;
  };
  useEffect(() => { location.replace(target()); });
  return (
    <div className="hp3-container" style={{ padding: '80px 0', textAlign: 'center' }}>
      <p>{t(`This page moved to ${en}.`, `انتقلت هذه الصفحة إلى ${ar}.`)}</p>
      <a className="hp3-button hp3-red" href={to}>{t(`Open ${en}`, `افتح ${ar}`)}<ArrowUpRight size={17} /></a>
    </div>
  );
}
