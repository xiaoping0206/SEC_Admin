/** 生活环境四类 Tab（与 env_items.category / env_tags 字段一致） */
export const ENV_CATEGORY_ORDER = ['hobby', 'lifestyle', 'personality', 'comm_style']

export const ENV_CATEGORY_LABELS = {
  hobby: '兴趣爱好',
  lifestyle: '生活方式',
  personality: '性格特征',
  comm_style: '沟通偏好'
}

/**
 * 将规则表 env_items 转为 UI 分组
 * @param {Array<{ category, item_code, item_name_zh?, label?, sort? }>} envItems
 */
export function buildEnvTagGroups(envItems = []) {
  const bucket = {}
  for (const key of ENV_CATEGORY_ORDER) {
    bucket[key] = []
  }

  for (const row of envItems) {
    const cat = String(row?.category ?? '').trim()
    if (!bucket[cat]) continue
    const code = String(row?.item_code ?? '').trim()
    const label = String(row?.item_name_zh ?? row?.label ?? '').trim()
    if (!code || !label) continue
    bucket[cat].push({
      code,
      label,
      sort: Number(row?.sort) || 0
    })
  }

  return ENV_CATEGORY_ORDER.map((key) => ({
    key,
    tabLabel: ENV_CATEGORY_LABELS[key] || key,
    tags: bucket[key]
      .sort((a, b) => a.sort - b.sort || a.label.localeCompare(b.label, 'zh-CN'))
  }))
}

/** @param {ReturnType<typeof buildEnvTagGroups>} groups */
export function buildLabelLookup(groups) {
  const map = {}
  for (const g of groups) {
    for (const t of g.tags) {
      map[`${g.key}:${t.code}`] = t.label
    }
  }
  return map
}

/**
 * 将库中 env_tags 规范为 item_code 数组（兼容历史中文 label）
 * @param {object} raw
 * @param {ReturnType<typeof buildEnvTagGroups>} groups
 */
export function normalizeStoredEnvTags(raw, groups) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const out = {}
  for (const key of ENV_CATEGORY_ORDER) {
    const group = groups.find((g) => g.key === key)
    const validCodes = new Set((group?.tags || []).map((t) => t.code))
    const labelToCode = {}
    for (const t of group?.tags || []) {
      labelToCode[t.label] = t.code
    }
    const seen = new Set()
    const list = []
    for (const v of Array.isArray(src[key]) ? src[key] : []) {
      const s = String(v ?? '').trim()
      if (!s || seen.has(s)) continue
      let code = s
      if (validCodes.has(s)) {
        code = s
      } else if (labelToCode[s]) {
        code = labelToCode[s]
      } else {
        continue
      }
      if (!validCodes.has(code) || seen.has(code)) continue
      seen.add(code)
      list.push(code)
    }
    out[key] = list
  }
  return out
}

/**
 * @param {ReturnType<typeof buildEnvTagGroups>} groups
 */
export function getEnvTagLabel(groups, category, code) {
  const g = groups.find((x) => x.key === category)
  const hit = g?.tags?.find((t) => t.code === code)
  return hit?.label || code
}

/**
 * @param {object} env
 * @param {ReturnType<typeof buildEnvTagGroups>} groups
 */
export function envTagsToDisplayList(env, groups) {
  if (!env || typeof env !== 'object') return []
  const out = []
  for (const key of ENV_CATEGORY_ORDER) {
    for (const code of Array.isArray(env[key]) ? env[key] : []) {
      out.push(getEnvTagLabel(groups, key, code))
    }
  }
  return out
}
