import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    sitemap({ hostname: "https://mermaid-live-preview.wahthefox.com/" }),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Mermaid Live Preview",
        short_name: "Mermaid Preview",
        description: "A live editor for Mermaid diagrams.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.js",
  },
});
