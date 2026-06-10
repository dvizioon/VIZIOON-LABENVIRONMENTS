export interface PageVariable {
  key: string
  protected: boolean
  persisted: boolean
}

export interface EnvImportItem {
  key: string
  value: string
  protected: boolean
}

export interface PageContext {
  ready: boolean
  title?: string
  saveEndpoint?: string
  variables: PageVariable[]
}

export interface ImportResult {
  success: boolean
  imported: number
  failed: { key: string; error: string }[]
  saved?: boolean
}

export interface ClearTabFilter {
  isDefault: boolean
  prefix: string
  customPrefixes: string[]
}

export interface ClearResult {
  cleared: number
  saved?: boolean
}

export type ContentMessage =
  | { type: 'PLUGIN_ENABLED'; enabled: boolean }
  | { type: 'TOGGLE_SIDEBAR'; tab?: string }
  | { type: 'OPEN_SIDEBAR'; tab?: string }
  | { type: 'PING' }
  | {
      type: 'IMPORT_VARIABLES'
      payload: {
        items: EnvImportItem[]
        autoSave: boolean
      }
    }
  | {
      type: 'CLEAR_PAGE_VARIABLES'
      tab: ClearTabFilter
      autoSave?: boolean
    }

export type ContentResponse =
  | { ok: true; data: PageContext }
  | { ok: true; data: ImportResult }
  | { ok: true; data: ClearResult }
  | { ok: false; error: string }
  | { ok: true }

export type BackgroundMessage =
  | { type: 'SET_FLOATING_ENABLED'; enabled: boolean }
  | { type: 'GET_FLOATING_ENABLED' }
  | { type: 'OPEN_SIDEBAR'; tab?: string }
