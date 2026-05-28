import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/odd_one_out/',
  plugins: [react()],
})
