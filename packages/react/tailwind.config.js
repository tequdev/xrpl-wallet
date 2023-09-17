/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'slide-top': 'slide-top 0.5s both',
        'slide-bottom': 'slide-bottom 0.5s both',
      },
      keyframes: {
        'slide-top': {
          '0%': {
            transform: 'translateY(50%) translateX(-50%)',
          },
          to: {
            transform: 'translateY(-50%) translateX(-50%)',
          },
        },
      },
    },
  },
  plugins: [require('daisyui')],
}
