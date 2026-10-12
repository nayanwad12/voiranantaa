import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    // SINGLE_FILE=1 bundles everything into one script (used only for the single-page preview).
    rollupOptions: process.env.SINGLE_FILE ? { output: { inlineDynamicImports: true } } : undefined,
  },
})
