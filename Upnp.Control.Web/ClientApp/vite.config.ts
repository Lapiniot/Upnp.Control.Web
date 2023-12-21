import react from "@vitejs/plugin-react"
import fs from "fs"
import { defineConfig, loadEnv } from "vite"
import generateSW from "./vite-plugin-generate-service-worker"

// https://vitejs.dev/config/

export default defineConfig(({ mode }) => {
    if (mode !== "development") return {
        plugins: [react(), generateSW({
            build: {
                rollupOptions: {
                    input: { "service-worker": "./src/service-worker.ts" }
                }
            },
            manifestExtraFiles: ["stack.svg", "symbols.svg", "icons/icon.svg", "icons/favicon.ico", "icons/apple-touch-icon.png",
                "icons/48.png", "icons/72.png", "icons/96.png", "icons/128.png", "icons/144.png", "icons/152.png", "icons/192.png",
                "icons/384.png", "icons/512.png", "manifest.webmanifest"]
        })]
    };

    const env = loadEnv(mode, process.cwd(), '');
    const options = { target: env.PROXY_TO ?? "http://localhost:8080" }
    return {
        plugins: [react()],
        server: {
            host: true,
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