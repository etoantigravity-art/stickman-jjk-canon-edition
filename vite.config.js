import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/pollinations': {
        target: 'https://image.pollinations.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pollinations/, '')
      }
    }
  }
})
