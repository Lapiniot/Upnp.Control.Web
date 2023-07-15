import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"

// https://vitejs.dev/config/

const options = {
  target: "http://localhost:8080"
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8082,
    https: {
      cert: fs.readFileSync("../upnp-dashboard.crt"),
      key: fs.readFileSync("../upnp-dashboard.key"),
    },
    strictPort: true,
    proxy: {
      "/api": options,
      "/proxy": options,
      "/dlna-proxy": options,
      "/upnpevents": { ...options, ws: true }
    }
  }
})