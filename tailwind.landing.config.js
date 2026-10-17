import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';
import { borderRadius, colors } from './tailwind.shared.js';

export default {
  darkMode: 'class',
  content: ['./index.html', './app.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors,
      borderRadius,
      spacing: {
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'margin-mobile': '1.25rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-2xl': '4rem',
        'gutter-mobile': '1rem',
        'space-xl': '2.5rem',
        gutter: '1.5rem',
        margin: '2.5rem',
      },
      fontFamily: {
        'headline-sm': ['Newsreader', 'serif'],
        'timer-display-mobile': ['Newsreader', 'serif'],
        'display-hero': ['Newsreader', 'serif'],
        'headline-md': ['Newsreader', 'serif'],
        'body-lg': ['Plus Jakarta Sans', 'sans-serif'],
        'label-md': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-lg': ['Newsreader', 'serif'],
        'headline-lg-mobile': ['Newsreader', 'serif'],
        'body-md': ['Plus Jakarta Sans', 'sans-serif'],
        'timer-display': ['Newsreader', 'serif'],
        'label-sm': ['Plus Jakarta Sans', 'sans-serif'],
        'display-hero-mobile': ['Newsreader', 'serif'],
        'body-sm': ['Plus Jakarta Sans', 'sans-serif'],
      },
      fontSize: {
        'headline-sm': [
          '20px',
          {
            lineHeight: '28px',
            fontWeight: '500',
          },
        ],
        'timer-display-mobile': [
          '60px',
          {
            lineHeight: '68px',
            letterSpacing: '-0.02em',
            fontWeight: '300',
          },
        ],
        'display-hero': [
          '56px',
          {
            lineHeight: '64px',
            letterSpacing: '-0.02em',
            fontWeight: '400',
          },
        ],
        'headline-md': [
          '26px',
          {
            lineHeight: '34px',
            letterSpacing: '-0.01em',
            fontWeight: '400',
          },
        ],
        'body-lg': [
          '18px',
          {
            lineHeight: '28px',
            fontWeight: '400',
          },
        ],
        'label-md': [
          '12px',
          {
            lineHeight: '16px',
            letterSpacing: '0.06em',
            fontWeight: '600',
          },
        ],
        'headline-lg': [
          '36px',
          {
            lineHeight: '44px',
            letterSpacing: '-0.015em',
            fontWeight: '400',
          },
        ],
        'headline-lg-mobile': [
          '28px',
          {
            lineHeight: '36px',
            letterSpacing: '-0.01em',
            fontWeight: '400',
          },
        ],
        'body-md': [
          '15px',
          {
            lineHeight: '24px',
            fontWeight: '400',
          },
        ],
        'timer-display': [
          '84px',
          {
            lineHeight: '92px',
            letterSpacing: '-0.03em',
            fontWeight: '300',
          },
        ],
        'label-sm': [
          '11px',
          {
            lineHeight: '14px',
            letterSpacing: '0.08em',
            fontWeight: '600',
          },
        ],
        'display-hero-mobile': [
          '38px',
          {
            lineHeight: '46px',
            letterSpacing: '-0.015em',
            fontWeight: '400',
          },
        ],
        'body-sm': [
          '13px',
          {
            lineHeight: '20px',
            fontWeight: '400',
          },
        ],
      },
    },
  },
  plugins: [forms, containerQueries],
};
