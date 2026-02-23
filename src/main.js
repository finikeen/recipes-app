import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ForgePreset from './theme.js'
import 'primeicons/primeicons.css'
import router from './router/index.js'
import App from './App.vue'
import './assets/main.css'
import { useAuthStore } from './features/auth/store.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: ForgePreset,
    options: {
      darkModeSelector: '.dark'
    }
  }
})

// Initialize Firebase auth listener before mounting
const authStore = useAuthStore()
authStore.initializeAuthListener().then(() => {
  app.mount('#app')
})
