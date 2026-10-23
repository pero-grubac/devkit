import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const YEAR = 60 * 60 * 24 * 365;

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "DevKit",
        short_name: "DevKit",
        description: "30 offline-friendly developer tools: JSON, JWT, regex, hashes, cron, CIDR and more.",
        theme_color: "#0f0f16",
        background_color: "#09090e",
        display: "standalone",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        runtimeCaching: [
          {
            // js-yaml and marked are pulled from cdnjs on first use of YAML / Markdown.
            urlPattern: /^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/(js-yaml|marked)\//,
            handler: "CacheFirst",
            options: {
              cacheName: "cdn-libs",
              expiration: { maxEntries: 10, maxAgeSeconds: YEAR },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 20, maxAgeSeconds: YEAR },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  base: "/devkit/",
  server: { port: 3000 },
});
