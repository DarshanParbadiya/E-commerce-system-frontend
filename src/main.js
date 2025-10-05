import Vue from 'vue'
import VueI18n from 'vue-i18n'
import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import enLocale from 'element-ui/lib/locale/lang/en'
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import frLocale from 'element-ui/lib/locale/lang/fr'

import VCharts from 'v-charts'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

// Import your own locale files
import enMessages from '@/lang/en'
import zhMessages from '@/lang/zh'
import frMessages from '@/lang/fr'


import '@/icons' // icon
import '@/permission' // permission control
import fr from './lang/fr'

Vue.use(VueI18n)


const messages = {
  en: {
    ...enLocale,
    ...enMessages
  },
  zh: {
    ...zhLocale,
    ...zhMessages
  },
  fr: {
    ...frLocale,
    ...frMessages
  }
}

const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'en', // default or saved language
  messages
})

Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value)
})

Vue.use(VCharts)

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  i18n,
  components: { App }
})
