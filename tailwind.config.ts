import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 20px rgba(34, 211, 238, .35), 0 0 60px rgba(34, 197, 94, .18)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(1200px circle at 20% 10%, rgba(34,211,238,.18), transparent 55%), radial-gradient(900px circle at 85% 40%, rgba(34,197,94,.14), transparent 60%), radial-gradient(700px circle at 50% 90%, rgba(59,130,246,.10), transparent 55%)",
      },
      keyframes: {
        floaty: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
        pulseGlow: {
          "0%,100%": { boxShadow: "0 0 0 rgba(34, 211, 238, .0)" },
          "50%": { boxShadow: "0 0 28px rgba(34, 211, 238, .30)" },
        },
      },
      animation: {
        floaty: "floaty 3.2s ease-in-out infinite",
        pulseGlow: "pulseGlow 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
