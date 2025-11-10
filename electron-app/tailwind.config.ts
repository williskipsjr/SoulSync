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
        // Mood-based color schemes
        anxiety: {
          light: '#E8F4F8',
          DEFAULT: '#4A90A4',
          dark: '#2C5F75',
        },
        depression: {
          light: '#E5E7EB',
          DEFAULT: '#6B7280',
          dark: '#374151',
        },
        sad: {
          light: '#DBEAFE',
          DEFAULT: '#3B82F6',
          dark: '#1E40AF',
        },
        happy: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#D97706',
        },
        calm: {
          light: '#D1FAE5',
          DEFAULT: '#10B981',
          dark: '#059669',
        },
      },
    },
  },
  plugins: [],
}
export default config
