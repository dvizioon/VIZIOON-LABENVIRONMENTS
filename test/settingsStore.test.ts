import { describe, expect, it } from 'vitest'
import { normalizeSettings } from '../src/stores/settingsStore'

describe('normalizeSettings', () => {
  it('retorna padrões quando storage está vazio ou inválido', () => {
    expect(normalizeSettings(undefined)).toEqual({
      autoSave: true,
      floatingButtonEnabled: false,
      privacyAccepted: false,
    })
    expect(normalizeSettings([])).toEqual({
      autoSave: true,
      floatingButtonEnabled: false,
      privacyAccepted: false,
    })
  })

  it('mantém booleans válidos e ignora tipos errados', () => {
    expect(
      normalizeSettings({
        autoSave: false,
        floatingButtonEnabled: true,
        privacyAccepted: true,
        extra: 'x',
      }),
    ).toEqual({
      autoSave: false,
      floatingButtonEnabled: true,
      privacyAccepted: true,
    })

    expect(
      normalizeSettings({
        autoSave: 'sim',
        floatingButtonEnabled: 1,
        privacyAccepted: null,
      }),
    ).toEqual({
      autoSave: true,
      floatingButtonEnabled: false,
      privacyAccepted: false,
    })
  })
})
