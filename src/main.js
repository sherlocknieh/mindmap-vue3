import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon-font/iconfont.css'
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import eventBus, { emitter } from '@/utils/eventBus'
import { getLang } from '@/api/localStorage'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// Polyfills for Node globals used by some deps in browser
import { Buffer } from 'buffer'
import process from 'process'
if (!window.Buffer) window.Buffer = Buffer
if (!window.process) window.process = process

const app = createApp(App)
const pinia = createPinia()

// Setup plugins
app.use(pinia)
app.use(router)
app.use(i18n)
app.use(ElementPlus)
app.use(VueViewer)
app.use(eventBus)

// Set initial locale
i18n.global.locale.value = getLang()

// Make emitter globally available
app.config.globalProperties.$emitter = emitter

// Register Element Plus icons globally to simplify usage
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Debug: capture Element Plus only-child warnings to identify the component
app.config.warnHandler = (msg, instance, trace) => {
  try {
    const text = typeof msg === 'string' ? msg : String(msg)
    if (text.includes('[ElOnlyChild]')) {
      const comp = instance && instance.type
      const name = comp && (comp.name || comp.__file) ? (comp.name || comp.__file) : comp
      // Print clearer diagnostic info for developer
      // eslint-disable-next-line no-console
      console.error('[ElOnlyChild] detected in component:', name, '\nTrace:', trace)
    }
  } catch (e) {
    // ignore
  }
}

const initApp = () => {
  app.mount('#app')
}

// 是否处于接管应用模式
if (window.takeOverApp) {
  window.initApp = initApp
  window.$bus = emitter
} else {
  initApp()
}
