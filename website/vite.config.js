import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
"type": "module"

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})
