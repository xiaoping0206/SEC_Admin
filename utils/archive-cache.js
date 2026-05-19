const KEY = 'sec_archive_lists_cache'

export function saveArchiveLists(takers, givers) {
  try {
    const payload = {
      takers: Array.isArray(takers) ? takers : [],
      givers: Array.isArray(givers) ? givers : [],
      savedAt: Date.now()
    }
    uni.setStorageSync(KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function loadArchiveLists() {
  try {
    const raw = uni.getStorageSync(KEY)
    if (!raw) return null
    const str = typeof raw === 'string' ? raw : JSON.stringify(raw)
    return JSON.parse(str)
  } catch {
    return null
  }
}
