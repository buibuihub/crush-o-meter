/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F1E8',
        paper: '#FCF8F2',
        ink: '#251B23',
        plum: '#392332',
        mauve: '#7A6670',
        rose: '#D84A62',
        coral: '#F16D68',
        blush: '#F5D8D2',
        sage: '#DCE3D4',
        gold: '#D9A85B',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        hand: ['Caveat', 'cursive'],
      },
      boxShadow: {
        soft: '0 20px 60px -28px rgba(57, 35, 50, 0.35)',
        lift: '0 28px 80px -35px rgba(57, 35, 50, 0.5)',
        card: '0 1px 0 rgba(255,255,255,0.7) inset, 0 14px 45px -30px rgba(57,35,50,0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-10px) rotate(2deg)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.12)' },
          '70%': { transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        'page-flip-next': {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'rotateY(-180deg)', opacity: '0' },
        },
        'page-flip-prev': {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '100%': { transform: 'rotateY(180deg)', opacity: '0' },
        },
        'page-enter-next': {
          '0%': { transform: 'rotateY(180deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        'page-enter-prev': {
          '0%': { transform: 'rotateY(-180deg)', opacity: '0' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
        'cover-open': {
          '0%': { transform: 'perspective(1800px) rotateY(0deg)', boxShadow: '5px 0 25px rgba(0,0,0,0.25)' },
          '100%': { transform: 'perspective(1800px) rotateY(-175deg)', boxShadow: '0 0 5px rgba(0,0,0,0.05)' },
        },
        'page-curl': {
          '0%': { transform: 'perspective(1800px) rotateY(0deg) scale(1)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08)' },
          '50%': { transform: 'perspective(1800px) rotateY(-90deg) scale(0.96)', boxShadow: 'inset -8px 0 20px rgba(0,0,0,0.15)' },
          '100%': { transform: 'perspective(1800px) rotateY(-180deg) scale(1)', boxShadow: 'inset 0 0 30px rgba(0,0,0,0.08)' },
        },
        'polaroid-drop': {
          '0%': { opacity: '0', transform: 'translateY(-20px) rotate(-8deg) scale(0.9)' },
          '60%': { opacity: '1', transform: 'translateY(4px) rotate(1deg) scale(1.02)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotate(var(--tw-rotate, 0deg)) scale(1)' },
        },
        'tape-stick': {
          '0%': { opacity: '0', transform: 'translateX(-50%) scaleX(0.3) rotate(var(--tw-rotate, 0deg))' },
          '60%': { opacity: '1', transform: 'translateX(-50%) scaleX(1.05) rotate(var(--tw-rotate, 0deg))' },
          '100%': { opacity: '0.9', transform: 'translateX(-50%) scaleX(1) rotate(var(--tw-rotate, 0deg))' },
        },
        'diary-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(216,74,98,0.3)' },
          '50%': { boxShadow: '0 0 0 12px rgba(216,74,98,0)' },
        },
        'skeleton-page': {
          '0%': { opacity: '0.4' },
          '50%': { opacity: '0.7' },
          '100%': { opacity: '0.4' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        heartbeat: 'heartbeat 1.8s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'flip-next': 'page-flip-next 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'flip-prev': 'page-flip-prev 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'enter-next': 'page-enter-next 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'enter-prev': 'page-enter-prev 0.5s cubic-bezier(0.4, 0, 0.2, 1) both',
        'cover-open': 'cover-open 0.8s cubic-bezier(0.4, 0, 0.2, 1) both',
        'page-curl': 'page-curl 0.6s cubic-bezier(0.4, 0, 0.2, 1) both',
        'polaroid-drop': 'polaroid-drop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'tape-stick': 'tape-stick 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'diary-pulse': 'diary-pulse 2s ease-in-out infinite',
        'skeleton-page': 'skeleton-page 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
