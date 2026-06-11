import { describe, expect, it } from 'vitest'
import {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  GITHUB_REPO,
  GITHUB_URL,
  PRIVACY_URL,
} from '../src/core/constants'

describe('constants', () => {
  it('mantém identidade do app', () => {
    expect(APP_NAME).toBe('VIZIOON')
    expect(APP_TAGLINE).toBe('LAB ENVIRONMENTS')
    expect(APP_VERSION).toBe('0.1.0')
  })

  it('expõe URLs públicas corretas', () => {
    expect(GITHUB_REPO).toBe('VIZIOON-LABENVIRONMENTS')
    expect(GITHUB_URL).toBe('https://github.com/dvizioon/VIZIOON-LABENVIRONMENTS')
    expect(PRIVACY_URL).toContain('/docs/privacidade')
  })
})
