// Single choke point for reading environment variables. Nothing else in the
// app should touch `process.env` directly — that keeps secret values out of
// client bundles by construction and gives us one place to reason about
// what's configured vs. missing.

function readServer(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
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
      return readServer('AUTH_SESSION_SECRET') ?? 'insecure-dev-only-secret-change-me';
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
