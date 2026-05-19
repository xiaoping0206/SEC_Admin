/** Figma 3588:7775 / 3588:7883 列表负载状态 */

import { unwrapCloudObjectData } from '@/utils/cloud-result.js'

export function filterActiveTakers(rows) {
  return (rows || []).filter(
    (r) =>
      r &&
      !r.is_deleted &&
      (r.status === 'active' || r.status === undefined || r.status === '')
  )
}

export function filterActiveGivers(rows) {
  return (rows || []).filter(
    (r) =>
      r &&
      !r.is_deleted &&
      (r.status === 'active' || r.status === undefined || r.status === '')
  )
}

export async function fetchActiveTakers() {
  const tm = uniCloud.importObject('taker-manager')
  const res = await tm.getTakerList({ page: 1, pageSize: 500 })
  const raw = unwrapCloudObjectData(res) ?? res?.data ?? []
  return filterActiveTakers(Array.isArray(raw) ? raw : [])
}

export async function fetchActiveGivers() {
  const gm = uniCloud.importObject('giver-manager')
  const res = await gm.getGiverList({ page: 1, pageSize: 500 })
  const raw = unwrapCloudObjectData(res) ?? res?.data ?? []
  return filterActiveGivers(Array.isArray(raw) ? raw : [])
}

export function getTakerLoadKey(item) {
  if (!item) return 'loose'
  return item.is_matched ? 'tight' : 'loose'
}

export function getGiverLoadKey(item) {
  if (!item) return 'loose'
  const max = Number(item.max_taker_count) || 5
  const cur = Number(item.current_taker_count) || 0
  const ratio = max > 0 ? cur / max : 0
  if (ratio >= 1) return 'full'
  if (ratio >= 0.6) return 'tight'
  return 'loose'
}

export const TAKER_LOAD_ICON = {
  loose: '/static/figma/matching/select/taker_load_loose.png',
  tight: '/static/figma/matching/select/taker_load_tight.png'
}

export const GIVER_LOAD_ICON = {
  loose: '/static/figma/matching/select/giver_load_loose.png',
  tight: '/static/figma/matching/select/giver_load_tight.png',
  full: '/static/figma/matching/select/giver_load_full.png'
}

export function avatarColor(name, seed = 0) {
  const palette = ['#FFB74D', '#64B5F6', '#BA68C8', '#81C784', '#F06292']
  const s = String(name || '').charCodeAt(0) + seed
  return palette[s % palette.length]
}
