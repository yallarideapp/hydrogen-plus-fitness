import type { Metadata } from 'next';
import AdminPanel from '@/components/admin/AdminPanel';

export const metadata: Metadata = { title: 'Site admin | Hydrogen Plus Fitness', robots: { index: false, follow: false } };
export default function AdminPage() { return <AdminPanel />; }
