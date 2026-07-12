/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: '#0D1B2E',
        'asphalt-soft': '#20344F',
        concrete: '#F0EEE6',
        'concrete-dim': '#DFDBCF',
        card: '#FFFFFF',
        brand: {
          DEFAULT: '#0F2A4A',
          dark: '#081A30',
          light: '#1E3F66'
        },
        rebar: '#1E3A5F',
        go: '#2F9E44',
        caution: '#FFB800',
        danger: '#D6373A'
      },
      fontFamily: {
        display: ['"Oswald"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        card: '10px'
      },
      minHeight: {
        tap: '48px'
      }
    }
  },
  plugins: []
}
