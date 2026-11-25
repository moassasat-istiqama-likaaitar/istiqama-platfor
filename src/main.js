import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

import '@fontsource/cairo/400.css'
import '@fontsource/cairo/600.css'
import '@fontsource/cairo/700.css'
import '@fontsource/baloo-bhaijaan-2/500.css'
import '@fontsource/baloo-bhaijaan-2/700.css'
import 'primeicons/primeicons.css'
import './styles/main.css'

import App from './App.vue'
import router from './router'
import i18n from './i18n'
import { IstiqamaPreset } from './config/theme'
import { primeLocales } from './i18n/primeLocales'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(PrimeVue, {
  theme: {
    preset: IstiqamaPreset,
    options: { darkModeSelector: '.app-dark', cssLayer: false }
  },
  locale: primeLocales.ar
})
app.use(ToastService)
app.directive('tooltip', Tooltip)

app.mount('#app')
