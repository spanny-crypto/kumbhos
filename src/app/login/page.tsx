'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchJSON, FetchClientError } from '@/lib/http/fetchClient';
import { DEMO_ACCOUNTS } from '@/lib/auth/demoAccounts';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage(null);
    try {
      await fetchJSON('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      router.push(params.get('next') || '/command');
      router.refresh();
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof FetchClientError ? err.message : 'Could not sign in. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="heading-serif text-2xl text-paper-text">
            KumbhOS
          </Link>
          <p className="mt-1 text-sm text-paper-muted">Command Centre sign-in</p>
        </div>
        <form onSubmit={handleSubmit} className="paper-card space-y-3 p-5">
          <label className="block text-sm text-paper-muted">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-paper-border bg-paper-bg px-3 py-2 text-sm text-paper-text"
            />
          </label>
          <label className="block text-sm text-paper-muted">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-paper-border bg-paper-bg px-3 py-2 text-sm text-paper-text"
            />
          </label>
          {status === 'error' && <p className="text-sm text-risk-critical">{errorMessage}</p>}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="fast-transition w-full rounded-lg bg-brand-200 px-4 py-2 text-sm font-semibold text-paper-text hover:bg-brand-300 disabled:opacity-50"
          >
            {status === 'submitting' ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <details className="mt-4 rounded-xl border border-paper-border bg-paper-surface p-3 text-xs text-paper-muted">
          <summary className="cursor-pointer select-none text-paper-text">Demo credentials</summary>
          <ul className="mt-2 space-y-1">
            {DEMO_ACCOUNTS.map((a) => (
              <li key={a.username}>
                <code className="text-paper-text">{a.username}</code> / <code className="text-paper-text">{a.password}</code> — {a.role.replace('_', ' ')}
              </li>
            ))}
          </ul>
        </details>

        <p className="mt-6 text-center text-sm font-bold text-paper-text">A SPANDAN PARAKH PRODUCTION</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
