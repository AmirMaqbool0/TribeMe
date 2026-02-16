import type { Config } from "tailwindcss";

const config: Config = {
  mode: 'jit',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/component/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'light-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '50%': { transform: 'translateX(2px)' },
          '75%': { transform: 'translateX(-2px)' },
        },
      },
      animation: {
        'light-shake': 'light-shake 0.5s ease-in-out',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        proxima: ['Proxima Nova', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        cairo: ['Cairo', 'sans-serif'],
        'dm-sans': ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Red: '#ff3951',
        //brands colors
        black: '#000000',
        primary: '#FFFFFF',
        Blackish: '#131313',
        Red: '#FF3951',
        'cultured': '#FAFAFA',
        'alice-blue': '#E9EDF7',
        'eerie-black': '#252525',
        'silver-sand': '#C4C4C4',
        'space-cadet': '#1B2559',
        'raisin-black': '#1C1B1F',
        'spanish-gray': '#989797',
        'facebook-blue': '#1877F2',
        'wild-blue-younder': '#A3AED0',
        'dark-charcoal': '#2D3748',
        'slate-gray': '#4A5568',
        'dark-gray': '#A9A9A9',
        'onyx': '#272727',
        'anti-flash-white': '#F5F5F5',

        // Input fields
        'charcoal': '#1A202C',
        'grayish-blue': '#718096',
        'light-gray': '#EDF2F7',
        'pale-gray': '#E1E6EF',
        'dim-gray': '#4B4B4B',

        //others colors
        'soft-gray': '#F9F9F9',
        'gray-656565': '#656565',
        'gray-4e4e4e': '#4E4E4E',
        'light-silver': '#E6E6E6',
      },
    },
  },
  // plugins: [require("@tailwindcss/forms")],
  plugins: [],
};
export default config;
