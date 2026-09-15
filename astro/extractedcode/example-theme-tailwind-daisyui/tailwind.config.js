/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./tpl/*.ftl'],
  theme: {
    extend: {
      keyframes: {
        progressBar: {
          "0%": {
            width: "0%",
          },
          "100%": {
            width: "100%",
          }
        }
      },
      animation: {
        progressBar: "progressBar 10s ease-in 1",
      }
    },
  },
  plugins: [require("daisyui")],

  daisyui: {
    themes: [
      'corporate',
      {
        business: {
          ...require("daisyui/src/colors/themes")["[data-theme=business]"],
          'primary': '#c891f2'
        }
      }
    ],
    darkTheme: 'business',
  }
}
