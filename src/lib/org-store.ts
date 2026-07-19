const STORAGE_KEY = 'everlight:selectedOrg'

export function loadSavedOrgId(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'null' || v === '' ? null : v
  } catch {
    return null
  }
}

export function saveOrgId(v: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, v ?? '')
  } catch {}
}
