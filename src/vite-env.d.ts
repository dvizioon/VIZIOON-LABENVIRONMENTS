/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

declare module '*.css?inline' {
  const src: string
  export default src
}
