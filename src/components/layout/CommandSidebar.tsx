'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { Role } from '@/lib/data/types';

const LINKS = [
  { href: '/command', label: 'Dashboard' },
  { href: '/command/map', label: 'Operations Map' },
  { href: '/command/simulator', label: 'Flow Simulator' },
  { href: '/command/incidents', label: 'Incidents' },
  { href: '/command/infrastructure', label: 'Infrastructure' },
  { href: '/command/sanitation', label: 'Sanitation' },
  { href: '/command/volunteers', label: 'Volunteers' },
  { href: '/command/lost-found', label: 'Lost & Found' }
];

export function CommandSidebar({ name, role }: { name: string; role: Role }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-ink-700 bg-ink-900">
      <div className="border-b border-ink-700 px-4 py-4">
        <p className="text-sm font-bold text-ink-50">KumbhOS Command</p>
        <p className="mt-0.5 text-xs text-ink-400">{name} · {role.replace('_', ' ')}</p>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-md px-3 py-2 text-sm transition ${
                active ? 'bg-accent/20 text-accent-light' : 'text-ink-300 hover:bg-ink-800 hover:text-ink-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-ink-700 p-2">
        <Link href="/" className="block rounded-md px-3 py-2 text-sm text-ink-400 hover:bg-ink-800 hover:text-ink-100">
          ← Public site
        </Link>
        <button onClick={logout} className="block w-full rounded-md px-3 py-2 text-left text-sm text-ink-400 hover:bg-ink-800 hover:text-ink-100">
          Sign out
        </button>
      </div>
    </aside>
  );
}
