import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { addCollection } from '@iconify/vue'
import phIcons from '@iconify-json/ph/icons.json'
import PopupView from './PopupView.vue'
import '../style.css'

addCollection(phIcons)

createApp(PopupView).use(createPinia()).mount('#app')
