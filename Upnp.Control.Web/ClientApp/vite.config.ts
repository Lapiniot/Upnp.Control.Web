import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import fs from "fs"

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
    if (mode !== "development") return { plugins: [react()] };

    const env = loadEnv(mode, process.cwd(), '');
    const options = { target: env.PROXY_TO ?? "http://localhost:8080" }
    return {
        plugins: [react()],
        server: {
            port: parseInt(env.PORT) ?? 8082,
            https: {
                cert: fs.readFileSync(env.SSL_CRT_FILE),
                key: fs.readFileSync(env.SSL_KEY_FILE),
            },
            strictPort: true,
            proxy: {
                "/api": options,
                "/proxy": options,
                "/dlna-proxy": options,
                "/upnpevents": { ...options, ws: true }
            }
        }
    }
})