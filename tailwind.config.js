/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./app/**/*.{js,ts,tsx}", "./components/**/*.{js,ts,tsx}"],

    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Poppins_400Regular", "sans-serif"],
                "poppins-medium": ["Poppins_500Medium"],
                "poppins-semibold": ["Poppins_600SemiBold"],

            },
        },
    },
    plugins: [],
};
