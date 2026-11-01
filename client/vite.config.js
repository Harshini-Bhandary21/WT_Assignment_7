import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the React app runs on 5173 and sends /api requests to the Express server on 5000.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': 'http://localhost:5000' } },
})
