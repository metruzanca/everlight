import { createSignal } from 'solid-js'

const STORAGE_KEY = 'everlight:selectedOrg'

function loadSaved(): string | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'null' || v === '' ? null : v
  } catch {
    return null
  }
}

function save(v: string | null) {
  try {
    localStorage.setItem(STORAGE_KEY, v ?? '')
  } catch {}
}

const [selectedOrgId, setSelectedOrgId] = createSignal<string | null>(null)

export function initSelectedOrg() {
  const saved = loadSaved()
  if (saved) setSelectedOrgId(saved)
}

export function getSelectedOrgId() {
  return selectedOrgId
}

export function setSelectedOrg(id: string | null) {
  setSelectedOrgId(id)
  save(id)
}
