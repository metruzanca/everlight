import { createLogger } from './logger'

const STORAGE_KEY = 'everlight:selectedOrg'
const log = createLogger('org-store')

export function loadSavedOrgId(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'null' || v === '' ? null : v
  } catch (err) {
    log.warn({ err }, 'failed to read selected org from localStorage')
    return null
  }
}

export function saveOrgId(v: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, v ?? '')
  } catch (err) {
    log.warn({ err }, 'failed to save selected org to localStorage')
  }
}
