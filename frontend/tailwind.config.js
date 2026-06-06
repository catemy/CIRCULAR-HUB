/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#eefdf5',
          100: '#d5f8e6',
          500: '#18a66b',
          600: '#0f8556',
          700: '#0c6a48',
          900: '#063528',
          950: '#031d17',
        },
        ink: '#17211d',
        mist: '#f5f7f4',
        line: '#dfe7e1',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(13, 46, 35, 0.10)',
        card: '0 12px 32px rgba(20, 58, 42, 0.08)',
      },
    },
  },
  plugins: [],
}
