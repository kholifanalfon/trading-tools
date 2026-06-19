import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from project root directory matching the FE_ prefix
  const env = loadEnv(mode, resolve(__dirname, "../../"), ["FE_"]);
  
  const port = env.FE_PORT ? parseInt(env.FE_PORT, 10) : 5173;
  const baseUrl = env.FE_BASE_URL || "/";

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        injectRegister: "auto",
        includeAssets: ["favicon.svg"],
        manifest: {
          name: "Trading Platform",
          short_name: "Trading",
          description: "Trading Screener and Backtesting Platform",
          theme_color: "#0a0a0c",
          background_color: "#0a0a0c",
          display: "standalone",
          start_url: baseUrl,
          scope: baseUrl,
          icons: [
            {
              src: "favicon.svg",
              sizes: "192x192 512x512",
              type: "image/svg+xml",
              purpose: "any maskable"
            }
          ]
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
          cleanupOutdatedCaches: true
        }
      })
    ],
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    },
    base: baseUrl,
    envDir: resolve(__dirname, "../../"),
    envPrefix: ["VITE_", "FE_"], // Allows accessing FE_ variables inside React app
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    server: {
      port: port,
    },
  };
});
