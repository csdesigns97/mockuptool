import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // Production builds are served from https://<user>.github.io/mockuptool/
  // by the GitHub Pages deploy workflow, so asset URLs need the repo name
  // as a base path. Keep the dev server at the site root.
  base: command === 'build' ? '/mockuptool/' : '/',
  plugins: [react()],
}))
