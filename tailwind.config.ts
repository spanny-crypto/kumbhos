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
        risk: {
          normal: '#1f9d55',
          building: '#c99a1e',
          critical: '#d9691a',
          intervention: '#c62828'
        },
        accent: {
          DEFAULT: '#2563eb',
          light: '#3b82f6'
        },
        // Light "paper" surface palette used by the public portal shell
        // (AppShell) and command centre — a friendlier, product-like look
        // distinct from the terminal-style ink palette used only by the
        // Live Billboard page.
        paper: {
          bg: '#f6f7f9',
          surface: '#ffffff',
          border: '#e6e8ec',
          text: '#171a1f',
          muted: '#6b7280',
          faint: '#9aa1ac'
        },
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      }
    }
  },
  plugins: []
};

export default config;
