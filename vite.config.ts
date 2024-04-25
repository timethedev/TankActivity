import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    watch: {
      usePolling: true
    },
    proxy: {
      '/socket.io': {
        target: 'ws://localhost:4000',
        ws: true,
      }
    }
  }
});