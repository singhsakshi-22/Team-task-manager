/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support class-based dark mode
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0B0F19',
          darker: '#060810',
          glass: 'rgba(30, 41, 59, 0.45)',
          border: 'rgba(255, 255, 255, 0.08)',
          neonTeal: '#06B6D4',
          neonViolet: '#8B5CF6',
          neonRose: '#F43F5E',
          neonEmerald: '#10B981',
          neonAmber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-teal': '0 0 15px rgba(6, 182, 212, 0.3)',
        'glow-violet': '0 0 15px rgba(139, 92, 246, 0.3)',
        'glow-rose': '0 0 15px rgba(244, 63, 94, 0.3)',
        'glow-emerald': '0 0 15px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
