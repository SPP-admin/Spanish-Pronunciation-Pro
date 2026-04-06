import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
// Default base "/" matches Vercel static hosting. For subpath deploys set VITE_BASE_PATH=/pronunciemos-app/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const raw = env.VITE_BASE_PATH ?? "/"
  const base = raw.endsWith("/") ? raw : `${raw}/`

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
