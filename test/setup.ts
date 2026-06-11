import { beforeEach } from 'vitest'

const storage = new Map<string, unknown>()

function chromeStorageMock() {
  return {
    local: {
      get: async (keys: string | string[] | Record<string, unknown> | null) => {
        if (keys === null) {
          return Object.fromEntries(storage.entries())
        }
        if (typeof keys === 'string') {
          return { [keys]: storage.get(keys) }
        }
        if (Array.isArray(keys)) {
          return Object.fromEntries(keys.map((key) => [key, storage.get(key)]))
        }
        return Object.fromEntries(
          Object.keys(keys).map((key) => [key, storage.get(key) ?? keys[key]]),
        )
      },
      set: async (items: Record<string, unknown>) => {
        for (const [key, value] of Object.entries(items)) {
          storage.set(key, value)
        }
      },
      remove: async (keys: string | string[]) => {
        const list = Array.isArray(keys) ? keys : [keys]
        for (const key of list) storage.delete(key)
      },
      clear: async () => {
        storage.clear()
      },
    },
  }
}

beforeEach(() => {
  storage.clear()
  globalThis.chrome = {
    storage: chromeStorageMock(),
  } as typeof chrome
})
