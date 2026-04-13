export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Barlow Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        body: ['Barlow', 'sans-serif'],
      },
      colors: {
        background: '#0c0c0c',
        foreground: '#f0f0f0',
        lime: {
          400: '#a3e635',
        },
      },
    },
  },
  plugins: [],
}