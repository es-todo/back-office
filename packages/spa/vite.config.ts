import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.json",
        buildMode: true, // enable/disable debugging in browser
      },
    }),
  ],
  server: {
    host: "0.0.0.0",
    port: 4000,
    strictPort: true,
    allowedHosts: ["back-office"],
  },
});
