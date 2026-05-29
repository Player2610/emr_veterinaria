/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Default brand colors — overridden at runtime by TenantTheme via ThemeContext
        primary: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#7C3AED',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#0EA5E9',
          foreground: '#FFFFFF',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        foreground: '#0F172A',
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#2563EB',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
