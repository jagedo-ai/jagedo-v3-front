import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    preview: {
        port: 3001
    },

    // for dev
    server: {
        port: 8080,
        host: '0.0.0.0',
	allowedHosts: ['uatv3.jagedo.co.ke'],
    },
    base: "/",
    define: {
        "process.env": {}
    }
});
