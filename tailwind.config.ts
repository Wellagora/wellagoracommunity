import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          light: "hsl(var(--accent-light))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          light: "hsl(var(--success-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-vibrant': 'var(--gradient-vibrant)',
        'gradient-nature': 'var(--gradient-nature)',
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-wave': 'var(--gradient-wave)',
        'gradient-atmospheric': 'var(--gradient-atmospheric)',
        'gradient-aqua': 'var(--gradient-aqua)',
        'gradient-depth': 'var(--gradient-depth)',
        'gradient-tech': 'var(--gradient-tech)',
        'gradient-glass': 'var(--gradient-glass)',
        'mountain-mist': 'linear-gradient(180deg, transparent 0%, hsl(220 60% 10% / 0.4) 30%, hsl(210 50% 15% / 0.6) 60%, hsl(195 40% 20% / 0.8) 100%)',
        'aqua-glow': 'radial-gradient(circle at center, hsl(170 95% 60% / 0.3) 0%, transparent 70%)',
        'organic-shapes': 'radial-gradient(ellipse at 30% 30%, hsl(170 95% 60% / 0.08) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, hsl(190 95% 55% / 0.06) 0%, transparent 50%), radial-gradient(circle at 50% 50%, hsl(210 100% 15% / 0.1) 0%, transparent 60%)',
      },
      boxShadow: {
        'eco': 'var(--shadow-eco)',
        'glow': 'var(--shadow-glow)',
        'card': 'var(--shadow-card)',
        'premium': 'var(--shadow-premium)',
        'float': 'var(--shadow-float)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--primary) / 0.6)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" }
        },
        "fade-up": {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        "fade-up-3d": {
          "0%": { transform: "translateY(40px) rotateX(15deg)", opacity: "0" },
          "100%": { transform: "translateY(0) rotateX(0deg)", opacity: "1" }
        },
        "slide-in-3d": {
          "0%": { transform: "translateX(-50px) rotateY(-15deg)", opacity: "0" },
          "100%": { transform: "translateX(0) rotateY(0deg)", opacity: "1" }
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.3)", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.6)", transform: "scale(1.02)" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.6s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out", 
        "fade-up": "fade-up 0.6s ease-out",
        "fade-up-3d": "fade-up-3d 1s ease-out",
        "slide-in-3d": "slide-in-3d 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
      },
      transitionTimingFunction: {
        'smooth': 'var(--transition-smooth)',
        'bounce': 'var(--transition-bounce)',
        'spring': 'var(--transition-spring)',
      },
      fontFamily: {
        'heading': 'var(--font-heading)',
        'body': 'var(--font-body)',
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'serif': ['Playfair Display', 'ui-serif', 'Georgia'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
