import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2C7CF2",
          50: "#EFF5FF",
          100: "#DCEAFF",
          200: "#B6D4FF",
          300: "#86B7FF",
          400: "#569AFF",
          500: "#2C7CF2",
          600: "#1E61D6",
          700: "#164CB0",
          800: "#123D8C",
          900: "#0F336F",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(44, 124, 242, 0.08)",
      },
    },
  },
  plugins: [],
} satisfies Config;