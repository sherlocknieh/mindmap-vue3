import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // Polyfill Node `stream` in browser for problematic deps
      stream: 'stream-browserify',
      // Polyfill Node `events` for browser (npm package `events`)
      events: 'events',
      buffer: 'buffer',
      process: 'process/browser',
      // Point `util` to a small browser shim that implements `debuglog`
      util: resolve(__dirname, 'src/shims/util.js')
    }
  },
  optimizeDeps: {
    include: ['stream-browserify', 'buffer', 'process', 'util', 'events']
  },
  define: {
    'process.env': {}
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  }
})
