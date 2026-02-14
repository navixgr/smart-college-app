import { defineConfig } from "vite";
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-group.svg"],
      manifest: {
        id: "/", // ✅ Fixes the "Computed App ID" warning
        name: "Concept of the Day",
        short_name: "COTD",
        description: "Daily technical presentation booking system",
        theme_color: "#34A853",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/", // ✅ Ensures the app starts at the root
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
        // ✅ Fixes the "Richer PWA Install UI" error
        screenshots: [
          {
            src: "screenshot-mobile.jpg", // Ensure this file is in your /public folder
            sizes: "648x1280", // Matches the dimensions in your screenshot
            type: "image/jpg",
            form_factor: "narrow",
            label: "Student Dashboard Mobile"
          },
          {
            src: "screenshot-desktop.jpg", // Ensure this file is in your /public folder
            sizes: "1348x605",
            type: "image/jpg",
            form_factor: "wide",
            label: "Student Dashboard Desktop"
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
  ],
});