/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"]
      },
      colors: {
        vasta: {
          bg: "rgb(var(--bg) / <alpha-value>)",
          surface: "rgb(var(--surface) / <alpha-value>)",
          "surface-soft": "rgb(var(--surface-soft) / <alpha-value>)",
          border: "rgb(var(--border) / <alpha-value>)",
          
          primary: "rgb(var(--primary) / <alpha-value>)",
          "primary-soft": "rgb(var(--primary-soft) / <alpha-value>)",
          accent: "rgb(var(--accent) / <alpha-value>)",
          "accent-soft": "rgb(var(--accent-soft) / <alpha-value>)",
          
          text: "rgb(var(--text) / <alpha-value>)",
          "text-soft": "rgb(var(--text-soft) / <alpha-value>)",
          muted: "rgb(var(--muted) / <alpha-value>)"
        }
      },
      boxShadow: {
        card: "var(--card-shadow)"
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    }
  },
  plugins: []
}

