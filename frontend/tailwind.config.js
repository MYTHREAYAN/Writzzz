/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f1ea",
          100: "#e7e0d1",
          700: "#2c3a4a",
          800: "#1c2733",
          900: "#121a22",
        },
        paper: {
          50: "#fbf8f1",
          100: "#f3ead8",
          200: "#e6d5b3",
        },
        terracotta: {
          500: "#c45c26",
          600: "#a64a1c",
          700: "#863b16",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        page: "0 24px 60px -28px rgba(18, 26, 34, 0.45)",
      },
    },
  },
  plugins: [],
};
