import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest", // ✅ Needed for custom Push logic
      srcDir: "src",                // ✅ Where your custom sw.js will live
      filename: "sw.js",            // ✅ Name of your custom worker file
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-group.svg"],
      manifest: {
        name: "Concept of the Day",
        short_name: "COTD",
        description: "Daily technical presentation booking system",
        theme_color: "#34A853",
        background_color: "#ffffff",
        display: "standalone",
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
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // ✅ Enable this to test PWA features on localhost
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
  ],
});