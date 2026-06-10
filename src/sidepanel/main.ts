import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SidePanel from './SidePanel.vue'
import '../style.css'

createApp(SidePanel).use(createPinia()).mount('#app')
