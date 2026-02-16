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
import { getLang } from '@/api'

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
