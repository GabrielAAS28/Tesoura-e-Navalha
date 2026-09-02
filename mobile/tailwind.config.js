/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular"],
        medium: ["PlusJakartaSans_500Medium"],
        semibold: ["PlusJakartaSans_600SemiBold"],
        bold: ["PlusJakartaSans_700Bold"],
        extrabold: ["PlusJakartaSans_800ExtraBold"],
      },
      colors: {
        bg: {
          base: "#121214",
          surface: "#1E1E24",
        },
        border: {
          DEFAULT: "#3F3F46",
        },
        text: {
          primary: "#F4F4F5",
          secondary: "#A1A1AA",
        },
        accent: {
          DEFAULT: "#D97706",
          hover: "#B45309",
        },
        status: {
          success: "#22C55E",
          error: "#EF4444",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
    },
  },
  plugins: [],
};
