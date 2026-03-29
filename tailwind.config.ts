import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'surface-dim': '#0e0e0e',
        'primary-container': '#9995ff',
        'on-primary-container': '#16007d',
        'error-container': '#a70138',
        'surface-variant': '#262626',
        'outline': '#767575',
        'surface': '#0e0e0e',
        'surface-tint': '#a8a4ff',
        'surface-container-high': '#201f1f',
        'error': '#ff6e84',
        'tertiary': '#c5ffc9',
        'primary-fixed': '#9995ff',
        'secondary-container': '#45445d',
        'on-secondary': '#504f68',
        'on-primary': '#1e009f',
        'on-surface': '#ffffff',
        'inverse-surface': '#fcf9f8',
        'outline-variant': '#484847',
        'on-background': '#ffffff',
        'tertiary-container': '#6bff8f',
        'tertiary-dim': '#5bf083',
        'on-secondary-container': '#cfcdeb',
        'surface-container-highest': '#262626',
        'inverse-primary': '#5044e3',
        'primary-dim': '#675df9',
        'background': '#0e0e0e',
        'surface-container-lowest': '#000000',
        'surface-container-low': '#131313',
        'inverse-on-surface': '#565555',
        'surface-container': '#1a1919',
        'on-error': '#490013',
        'primary': '#a8a4ff',
        'surface-bright': '#2c2c2c',
        'on-surface-variant': '#adaaaa',
        'secondary': '#e2dffe',
        'on-tertiary': '#00692c',
      },
      fontFamily: {
        'headline': ['Plus Jakarta Sans', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '1rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
