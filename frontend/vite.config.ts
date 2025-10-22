import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ADD THIS BLOCK
  server: {
    host: '0.0.0.0', // Makes the server accessible outside the container
    port: 5173,      // Matches docker-compose.yml
    watch: {
      usePolling: true, // Enables hot-reloading in Docker
    },
  },
})