/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'a': {
              color: '#0070f3',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              fontWeight: 'normal',
              '&:hover': {
                color: '#0051a3',
                textDecorationThickness: '2px',
              },
              '&:visited': {
                color: '#551A8B',
              },
            },
          },
        },
      },
    },
    screens: {
      // Use standard Tailwind breakpoints
      'md': '768px',
      // If you need a custom breakpoint at 1280px, add it with a custom name
      'custom-md': '1280px',
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
