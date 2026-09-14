import { Window } from 'happy-dom'

export function installTestDom() {
  if (typeof globalThis.document !== 'undefined') return

  const win = new Window({ url: 'https://gitlab.example/' })
  Object.defineProperty(globalThis, 'window', {
    value: win,
    configurable: true,
    writable: true,
  })
  Object.defineProperty(globalThis, 'document', {
    value: win.document,
    configurable: true,
    writable: true,
  })
}
