/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: '#0B0F19',
        surface: '#131A2B',
        surfaceHover: '#1C2538',
        border: '#232D42',
        borderFocus: '#00d4aa',
        primary: {
          DEFAULT: '#6c63ff',
          hover: '#7e77ff',
          glow: 'rgba(108, 99, 255, 0.25)',
        },
        secondary: {
          DEFAULT: '#00d4aa',
          hover: '#00e8bb',
        },
        danger: {
          DEFAULT: '#ff4757',
          hover: '#ff6b7a',
        },
        text: {
          DEFAULT: '#e2e8f0',
          muted: '#94a3b8',
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(108, 99, 255, 0.25)',
      }
    },
  },
  plugins: [],
}
