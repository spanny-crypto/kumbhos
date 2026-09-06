// Shared by lostFoundBackup.ts and wristbandBackup.ts. Without this, a
// misconfigured/paused/unreachable Supabase project doesn't fail fast — the
// underlying fetch just hangs until the platform's own connection timeout
// (observed: ~8 seconds in production), and every one of those calls runs
// inside a Promise.all in /api/dashboard-summary and /api/health, so a dead
// Supabase project silently turns the public dashboard into an 8-second
// load on every visit. abortSignal() cancels the request outright at this
// timeout instead of just racing it, so the connection doesn't linger.
const TIMEOUT_MS = 3000;

export function supabaseTimeoutSignal(): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}
