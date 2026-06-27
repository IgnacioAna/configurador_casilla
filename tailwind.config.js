/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        impacar: {
          fondo: '#F5F5F0',
          campo: '#2D5016',
          cobre: '#8B6914',
          texto: '#1A1A1A',
        },
        zona: {
          bano: '#BFE3EE',
          dormitorio: '#C9A66B',
          cocina: '#A7C796',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
