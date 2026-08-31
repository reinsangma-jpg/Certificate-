/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#2E2A38',
        cream: '#FFF8EF',
        coral: '#FF6F59',
        marigold: '#FFB627',
        teal: '#1FAE9F',
      },
      fontFamily: {
        display: ['"Fredoka"', 'ui-rounded', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        puff: '10px 10px 24px rgba(46,42,56,0.12), -8px -8px 18px rgba(255,255,255,0.9)',
        'puff-sm': '6px 6px 14px rgba(46,42,56,0.10), -5px -5px 11px rgba(255,255,255,0.9)',
        'puff-pressed': 'inset 4px 4px 10px rgba(46,42,56,0.10), inset -4px -4px 10px rgba(255,255,255,0.85)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(.85)', opacity: 0 }, '100%': { transform: 'scale(1)', opacity: 1 } },
        wiggle: { '0%,100%': { transform: 'rotate(-2deg)' }, '50%': { transform: 'rotate(2deg)' } },
        confetti: { '0%': { transform: 'translateY(0) rotate(0)', opacity: 1 }, '100%': { transform: 'translateY(70px) rotate(200deg)', opacity: 0 } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      animation: {
        pop: 'pop .35s cubic-bezier(.2,.9,.3,1.3)',
        wiggle: 'wiggle .5s ease-in-out',
        confetti: 'confetti 900ms ease-in forwards',
        float: 'float 4s ease-in-out infinite',
      },
    }
  },
  plugins: [],
}
