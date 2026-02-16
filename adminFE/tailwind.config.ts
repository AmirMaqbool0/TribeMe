import type { Config } from "tailwindcss";

const filters = require('tailwindcss-filters')

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    './app/**/*.{js,ts,jsx,tsx}',
    "./app/brands_KPIs/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/member_KPIs/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/login/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/register/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/offer/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      filter: {
        black: 'brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(7500%) hue-rotate(0deg) brightness(100%) contrast(100%)',
        gray: 'brightness(0) saturate(100%) invert(70%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(90%) contrast(90%)',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: '#FFFFFF',
        Blackish: '#131313',
        Red: '#FF3951',
        secondary: '#000000',
        'soft-gray': '#F9F9F9',
        'light-gray': '#F5F5F5',
        'gray-656565': '#656565',
        'dark-gray': '#272727',
        'gray-4b4b4b': '#4B4B4B',
        'gray-4e4e4e': '#4E4E4E',
        'light-silver': '#E6E6E6',
        'cool-gray': '#D1D5DB',
        'soft-pink': '#FF8C9A',
        'red-500': '#F56565',
        'gray-100': '#F3F4F6',
        'gray-200': '#E5E7EB',
        'gray-300': '#D1D5DB',
        'gray-500': '#6B7280',
        'gray-600': '#4B5563',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        proxima: ['Proxima Nova', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        nunito: ['Nunito Sans', 'sans-serif'],
      },
    },
  },
  plugins: [
    filters
  ],
};

export default config;