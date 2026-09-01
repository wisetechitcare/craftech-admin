/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A2647',
        'navy-dark': '#061b36',
        'navy-light': '#144272',
        accent: '#C41B1F',
        'accent-soft': 'rgba(196, 27, 31, 0.08)',
        'accent-dim': 'rgba(196, 27, 31, 0.15)',
        dark: '#08080c',
        'dark-2': '#12121a',
        mid: '#5b6b7f',
        light: '#f8fafc',
        surface: '#111827',
        'surface-2': '#1f2937',
        'surface-3': '#374151',

        // Admin surfaces + ink. Same navy/accent identity as the public site,
        // resolved for a light, dense data UI rather than a marketing page.
        canvas: '#f2f5f8',
        paper: '#ffffff',
        raise: '#f6f8fb',
        line: '#dfe6ee',
        'line-2': '#eef2f7',
        ink: '#0A2647',
        'ink-soft': '#47596e',
        'ink-mute': '#7386a0',
        'ink-faint': '#9fb0c4',
        ok: '#0f7a52',
        warn: '#a86a00',
        info: '#1d5fd0',
        danger: '#c0271f',
      },

      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        mono: ['"Fira Code"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
        sm: ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.7rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.02em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.02em' }],
        '5xl': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.03em' }],
        'h1': ['clamp(2.6rem, 6.5vw, 5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'h2': ['clamp(2rem, 4.2vw, 3.4rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'h3': ['clamp(1.25rem, 1.8vw, 1.6rem)', { lineHeight: '1.3', letterSpacing: '-0.015em' }],
        'eyebrow': ['0.7rem', { lineHeight: '1', letterSpacing: '0.18em' }],
      },

      spacing: {
        'gutter': 'var(--gutter, 2rem)',
      },

      boxShadow: {
        premium: '0 20px 40px rgba(0, 0, 0, 0.15)',
      },

      borderRadius: {
        '4xl': '32px',
        '5xl': '48px',
      },

      transitionDuration: { 250: '250ms', 350: '350ms', 400: '400ms' },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
    },
  },

  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.section': { '@apply py-14 md:py-20': {} },
        '.section-band': { '@apply py-10 md:py-12': {} },
      });
    },
  ],
}
