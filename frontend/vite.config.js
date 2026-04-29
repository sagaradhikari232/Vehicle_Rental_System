import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production"
    ? "/Vehicle_Rental_System/"
    : "/",
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // 👈 your Express port here
        changeOrigin: true,
      }
    }
  },
});


