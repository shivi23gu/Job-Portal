/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "#080f1a",
          secondary: "#0f1f35",
          card: "#111827",
          hover: "#1a2744",
        },
        border: {
          DEFAULT: "#1e3a5f",
          light: "#243b55",
        },
        accent: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
          2: "#06b6d4",
          3: "#8b5cf6",
        },
      },
      fontFamily: {
        display: ["Roboto","sans-serif"],
        body: [ "Roboto","sans-serif"],
      },
    },
  },
  plugins: [],
};
