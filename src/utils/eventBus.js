import mitt from 'mitt'

// Create event emitter instance
export const emitter = mitt()

// For compatibility with Vue 2's $bus
export default {
  install(app) {
    app.config.globalProperties.$bus = emitter
  }
}
