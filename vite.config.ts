import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevent multiple React copies in the bundle (fixes hooks dispatcher null errors)
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    // Make sure these are pre-bundled consistently in dev
    include: ["react", "react-dom", "react-router-dom", "framer-motion"],
  },
  // Strip console.log and console.warn from production builds
  esbuild: {
    drop: mode === "production" ? ["console", "debugger"] : [],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: ["framer-motion", "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu", "@radix-ui/react-tabs", "@radix-ui/react-tooltip", "@radix-ui/react-popover"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          query: ["@tanstack/react-query"],
        },
      },
    },
  },
}));
