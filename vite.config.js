import { defineConfig } from 'vite'

export default defineConfig({
  base: '/stickman-jjk-canon-edition/',
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
