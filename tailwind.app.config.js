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
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        'body-sm': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-sm': ['Newsreader', 'serif'],
        'label-sm': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-md': ['Newsreader', 'serif'],
        'label-md': ['Plus Jakarta Sans', 'sans-serif'],
        'headline-lg': ['Newsreader', 'serif'],
        'body-md': ['Plus Jakarta Sans', 'sans-serif'],
        'display-hero': ['Newsreader', 'serif'],
        'timer-display': ['Newsreader', 'serif'],
        'body-lg': ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [forms, containerQueries],
};
