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
        'contour-blue': '#4d65ff',
        'contour-blue-dark': '#3a4fd4',
        'contour-cream': '#f4ece1',
        'contour-cream-dark': '#ebe0d1',
        'contour-dark': '#1a1a1a',
        'contour-gray': '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
