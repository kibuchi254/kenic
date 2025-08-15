// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  // Server configuration for development
  server: {
    host: "::",
    port: 3005,
    allowedHosts: ['digikenya.co.ke'],
  },
  // Plugins to be used by Vite
  plugins: [
    react(),
    // Use component tagger only in development mode
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  // Path aliases for cleaner imports
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));