/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#8CC63E',
                secondary: '#6D6E72',
                background: '#FFFFFF',
                ortho: '#182D4D',
            },
            fontFamily: {
                sans: ['Montserrat', 'sans-serif'],
                serif: ['Optima', 'serif'],
            },
        },
    },
    plugins: [],
}
