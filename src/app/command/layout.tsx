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
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
