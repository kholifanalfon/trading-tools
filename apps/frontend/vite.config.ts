import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from project root directory matching the FE_ prefix
  const env = loadEnv(mode, resolve(__dirname, "../../"), ["FE_"]);
  
  const port = env.FE_PORT ? parseInt(env.FE_PORT, 10) : 5173;
  const baseUrl = env.FE_BASE_URL || "/";

  return {
    plugins: [react()],
    base: baseUrl,
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
