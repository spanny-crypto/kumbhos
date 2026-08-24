import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0e14',
          900: '#0f1520',
          800: '#161d2b',
          700: '#1f2836',
          600: '#2b3648',
          500: '#3d4a60',
          400: '#5b6a83',
          300: '#8494ac',
          200: '#b8c2d4',
          100: '#dde3ec',
          50: '#f2f5f9'
        },
        // Warm, slightly deeper than the reference-site status colors so
        // they stay legible as UI text/badges on the cream background —
        // these carry real safety meaning (safe/building/critical/
        // intervention), so the green<amber<orange<red progression is kept
        // intact even while the hues are retinted to match the new palette.
        risk: {
          normal: '#2e9b5c',
          building: '#d98a2b',
          critical: '#e0563a',
          intervention: '#b23a2e'
        },
        accent: {
          DEFAULT: '#2563eb',
          light: '#3b82f6'
        },
        // Warm cream "paper" surface palette — replaces the old cool-gray
        // theme, modeled on wisprflow.ai's actual site (cream bg, near-black
        // ink, warm putty borders). Used by the public portal shell and
        // login; the Command Centre intentionally stays on the dark `ink`
        // palette as its own separate staff-ops register.
        paper: {
          bg: '#fffdec',
          surface: '#f7f6ee',
          border: '#e4e4d0',
          text: '#1a1a1a',
          muted: '#78766f',
          faint: '#a3a199'
        },
        // Brand accent derived from the reference site's pastel-lavender
        // button treatment (their actual "Get started" button color is
        // #F0D7FF on near-black text) — kept as a full scale so it also
        // works as link/active-state text at readable contrast.
        brand: {
          50: '#fbf3ff',
          100: '#f5e3ff',
          200: '#f0d7ff',
          300: '#dcb2f2',
          400: '#c98fe8',
          500: '#a86bd1',
          600: '#8a52b3',
          700: '#6f4090'
        },
        // Decorative pastel chips lifted from the reference site's palette
        // (badges, tags, small accents only — never used for status/risk
        // meaning, which stays on the `risk` scale above).
        chip: {
          mint: '#34d399',
          coral: '#ff6c4c',
          amber: '#ffa946',
          pink: '#ffbcf2',
          forest: '#034f46'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Figtree', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', '"EB Garamond"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
