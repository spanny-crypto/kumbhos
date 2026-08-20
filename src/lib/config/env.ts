// Single choke point for reading environment variables. Nothing else in the
// app should touch `process.env` directly — that keeps secret values out of
// client bundles by construction and gives us one place to reason about
// what's configured vs. missing.

import { randomBytes } from 'crypto';

function readServer(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

// A hardcoded fallback secret would be visible to anyone who reads this
// (public) source code and could be used to forge a signed session cookie
// for any role, including SUPER_ADMIN — that actually happened once during
// this project's deployment before AUTH_SESSION_SECRET was set on the host.
// If the real env var is missing, generate a random one instead: still
// zero-config for local dev, but never a publicly-known value. The only
// cost is that sessions won't survive a server restart if this fallback
// path is ever hit — a much better failure mode than a guessable secret.
let generatedFallbackSecret: string | null = null;
function fallbackSessionSecret(): string {
  if (!generatedFallbackSecret) {
    generatedFallbackSecret = randomBytes(32).toString('base64url');
    console.warn(
      '[KumbhOS] AUTH_SESSION_SECRET is not set — generated a random one for this server process. ' +
        'Set AUTH_SESSION_SECRET in your deployment environment so sessions survive restarts.'
    );
  }
  return generatedFallbackSecret;
}

export const env = {
  demoMode: (process.env.DEMO_MODE ?? 'true').toLowerCase() !== 'false',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  supabase: {
    publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    get url() {
      return readServer('SUPABASE_URL') ?? this.publicUrl;
    },
    get serviceRoleKey() {
      return readServer('SUPABASE_SERVICE_ROLE_KEY');
    }
  },

  ai: {
    get baseUrl() {
      return readServer('AI_BASE_URL');
    },
    get model() {
      return readServer('AI_MODEL');
    },
    get apiKey() {
      return readServer('AI_API_KEY');
    }
  },

  auth: {
    get sessionSecret() {
      return readServer('AUTH_SESSION_SECRET') ?? fallbackSessionSecret();
    }
  }
};

/** True when the app should use the in-memory synthetic data provider. */
export function isDemoMode(): boolean {
  if (env.demoMode) return true;
  const hasSupabase = Boolean(env.supabase.url && env.supabase.serviceRoleKey);
  return !hasSupabase;
}

/** True when a real AI backend is configured and should be attempted. */
export function isAiConfigured(): boolean {
  return Boolean(env.ai.baseUrl && env.ai.model);
}

/**
 * True when Supabase credentials are present, independent of DEMO_MODE.
 * Used to back just the Lost & Found feature with real persistent storage
 * while the rest of the app stays on demo data — see
 * src/lib/data/lostFoundBackup.ts.
 */
export function isSupabaseLostFoundConfigured(): boolean {
  return Boolean(env.supabase.url && env.supabase.serviceRoleKey);
}
