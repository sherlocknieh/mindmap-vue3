import { createI18n } from 'vue-i18n'
import messages from './lang'

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: 'zh',
  fallbackLocale: 'zh',
  messages,
})

export default i18n
