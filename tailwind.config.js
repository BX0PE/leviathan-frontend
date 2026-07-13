/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Core surfaces
        asphalt:          '#0F1115',   // deep black — headers, nav, login bg
        'asphalt-soft':   '#374151',   // mid grey — secondary text, borders
        concrete:         '#F4F6F8',   // cool tech grey — page bg
        'concrete-dim':   '#E2E6EA',   // dividers, inactive borders
        card:             '#FFFFFF',   // card / panel bg

        // Accents
        brand: {
          DEFAULT: '#FF6B00',          // construction orange — CTA, progress, active
          dark:    '#CC5500',          // orange hover/press
          light:   '#FF8C33',          // orange subtle
        },
        rebar:   '#0052FF',            // industrial blue — section labels, selected state
        go:      '#00875A',            // success green
        caution: '#FF8B00',            // amber warning
        danger:  '#DE350B',            // error red
      },

      fontFamily: {
        display: ['"Inter"', 'system-ui', 'sans-serif'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"Roboto Mono"', '"IBM Plex Mono"', 'monospace'],
      },

      borderRadius: {
        card: '4px',   // sharp industrial corners — was 10px
      },

      minHeight: {
        tap: '48px',
      },
    },
  },
  plugins: [],
}
