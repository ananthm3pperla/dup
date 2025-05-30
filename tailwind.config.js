/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary colors with opacity support
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
          50: '#E6F0F7',
          100: '#CCE0EF',
          200: '#99C2DF',
          300: '#66A3CF',
          400: '#3385BF',
          500: '#004977',
          600: '#003A5F',
          700: '#002C47',
          800: '#001D2F',
          900: '#000F17',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          light: 'var(--color-secondary-light)',
          dark: 'var(--color-secondary-dark)',
          50: '#FCE8E8',
          100: '#F9D1D1',
          200: '#F3A3A3',
          300: '#ED7575',
          400: '#E74747',
          500: '#A12B2B',
          600: '#812222',
          700: '#611A1A',
          800: '#401111',
          900: '#200909',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          light: 'var(--color-accent-light)',
          dark: 'var(--color-accent-dark)',
          50: '#E6F7F8',
          100: '#CCF0F2',
          200: '#99E0E5',
          300: '#66D1D8',
          400: '#33C1CB',
          500: '#00A4B4',
          600: '#008390',
          700: '#00626C',
          800: '#004248',
          900: '#002124',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: 'var(--color-success-light)',
          dark: 'var(--color-success-dark)',
          bg: 'var(--color-success-bg)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: 'var(--color-warning-light)',
          dark: 'var(--color-warning-dark)',
          bg: 'var(--color-warning-bg)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          light: 'var(--color-error-light)',
          dark: 'var(--color-error-dark)',
          bg: 'var(--color-error-bg)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          light: 'var(--color-info-light)',
          dark: 'var(--color-info-dark)',
          bg: 'var(--color-info-bg)',
        },
      },
      backgroundColor: {
        app: 'var(--bg-app)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
      },
      textColor: {
        default: 'var(--text-default)',
        muted: 'var(--text-muted)',
        light: 'var(--text-light)',
      },
      borderColor: {
        default: 'var(--border-default)',
        dark: 'var(--border-dark)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'inner-xl': 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
};