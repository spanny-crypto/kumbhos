import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { CommandSidebar } from '@/components/layout/CommandSidebar';

// Server Component: this is the independent, real authorization check.
// middleware.ts only does a coarse cookie-presence redirect on the Edge
// runtime; this layout re-verifies the signed session (Node runtime) on
// every request to /command/**, and every API route re-verifies again via
// lib/auth/rbac.ts. None of these three checks trusts the others.
export default function CommandLayout({ children }: { children: React.ReactNode }) {
  const session = getSession();
  if (!session) redirect('/login?next=/command');

  return (
    <div className="flex min-h-screen bg-ink-950">
      <CommandSidebar name={session.name} role={session.role} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <div className="flex-1">{children}</div>
        <footer className="border-t border-ink-700 px-4 py-3 text-center text-xs font-bold text-ink-100">A SPANDAN PARAKH PRODUCTION</footer>
      </div>
    </div>
  );
}
