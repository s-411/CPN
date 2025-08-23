import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CPN Brand Colors
        'cpn-yellow': '#f2f661',
        'cpn-dark': '#1f1f1f',
        'cpn-white': '#ffffff',
        'cpn-gray': '#ABABAB',
        
        // Tailwind CSS 4 compatible color definitions
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: '#f2f661',
          foreground: '#1f1f1f',
        },
        secondary: {
          DEFAULT: '#ABABAB',
          foreground: '#1f1f1f',
        },
        muted: {
          DEFAULT: '#1f1f1f',
          foreground: '#ABABAB',
        },
        accent: {
          DEFAULT: '#f2f661',
          foreground: '#1f1f1f',
        },
        border: '#ABABAB',
        input: '#1f1f1f',
        ring: '#f2f661',
      },
      fontFamily: {
        // Custom brand fonts
        'heading': ['National2Condensed', 'Arial Black', 'sans-serif'],
        'body': ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['ESKlarheit', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // CPN brand button radius
        'cpn-button': '100px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

export default config