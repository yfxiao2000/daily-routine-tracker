import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  // safelist：确保动态分类颜色类不被 tree-shaking 移除
  safelist: [
    { pattern: /^text-(orange|blue|green|gray|purple|pink|red|teal|yellow|indigo)-600$/ },
    { pattern: /^bg-(orange|blue|green|gray|purple|pink|red|teal|yellow|indigo)-100$/ },
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-hover": "#1d4ed8",
        success: "#16a34a",
        danger: "#dc2626",
        "gray-bg": "#f8fafc",
        "gray-border": "#e2e8f0",
        "selected": "#dbeafe",
        "today": "#eff6ff",
      },
    },
  },
  plugins: [],
};
export default config;
