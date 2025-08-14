/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.jsx",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
     "./utils/**/*.{js,jsx}",
     "./api/**/*.{js,jsx}"
  ],
  theme: { extend: {} },
  plugins: [],
}

