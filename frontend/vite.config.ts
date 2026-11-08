import { defineConfig } from "vite";
import { offline } from "./offline";
import react from "@vitejs/plugin-react";

export default defineConfig({
  envDir: "..",
  plugins: [react(), offline()],
  server: { proxy: { "/api": "http://127.0.0.1:3001" } },
});
