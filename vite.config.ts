import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/Virtualizing-list-in-virtual-DOM/",
  plugins: [react(), tailwindcss()],
});
