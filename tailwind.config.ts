import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'paragon-cyan': '#00AEEF',
        'paragon-cyan-dark': '#0090C8',
        'paragon-navy': '#002B5C',
        'paragon-navy-dark': '#001F43',
        'paragon-light': '#F5F7FA',
        'paragon-light-dark': '#E2E6EB',
        'paragon-dark': '#1a1a2e',
        'paragon-gray': '#6b7280',
        'conqueror-green': '#1a9c40',
        'conqueror-green-dark': '#157a33',
        'conqueror-gold': '#f5c518',
        'conqueror-gold-dark': '#d4a017',
        'conqueror-bg': '#f8f8f8',
        'conqueror-header': '#0a1628',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
