// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#1f2937", // или ваш цвет
        // или с разными вариантами
        sidebar: {
          DEFAULT: "#1f2937",
          light: "#374151",
          dark: "#111827",
        },
      },
    },
  },
  plugins: [],
};
