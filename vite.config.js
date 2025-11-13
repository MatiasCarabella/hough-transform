import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/hough-transform/', // tu nombre de repo
  plugins: [react()],
})