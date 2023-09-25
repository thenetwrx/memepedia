module.exports = {
  daisyui: {
    themes: [
      {
        dark: {
          ...require("daisyui/src/theming/themes")["[data-theme=dark]"],
          primary: "#374151",
          secondary: "#6b7280",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
