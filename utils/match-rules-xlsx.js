/**
 * 从 xlsx 工作簿解析匹配规则（与 match_rules_v2.xlsx 各 Sheet 列名兼容）
 */
import * as XLSX from 'xlsx'
function normalizeKeys(row) {
  const out = {}
  if (!row || typeof row !== 'object') return out
  for (const [k, v] of Object.entries(row)) {
    const nk = String(k).trim().toLowerCase().replace(/\s+/g, '_')
    out[nk] = v
  }
  return out
}

function rowPassesStatus(norm, allowMissingStatus = false) {
  const has =
    Object.prototype.hasOwnProperty.call(norm, 'status') &&
    norm.status !== '' &&
    norm.status !== undefined &&
    norm.status !== null
  if (!has) return allowMissingStatus
  const s = norm.status
  if (typeof s === 'string' && String(s).trim() === '1') return true
  return s === 1 || Number(s) === 1
}

function str(v) {
  if (v === null || v === undefined) return ''
  return String(v).trim()
}

function num(v, def = 0) {
  if (v === '' || v === null || v === undefined) return def
  const n = Number(v)
  return Number.isFinite(n) ? n : def
}

function findSheet(wb, canonicalName) {
  const want = canonicalName.toLowerCase()
  const name = wb.SheetNames.find((n) => n.toLowerCase().replace(/\s+/g, '_') === want)
  return name ? wb.Sheets[name] : null
}

function sheetRows(ws) {
  if (!ws) return []
  return XLSX.utils.sheet_to_json(ws, { defval: null, raw: false })
}

function parseWuxing(ws) {
  return sheetRows(ws)
    .map(normalizeKeys)
    .filter((norm) => rowPassesStatus(norm, false))
    .map((row) => ({
      rule_id: str(row.rule_id),
      giver: str(row.giver),
      taker: str(row.taker),
      score: num(row.score),
      level: str(row.level),
      relation_code: str(row.relation_code),
      interaction_tag: str(row.interaction_tag),
      description: str(row.description)
    }))
}

function parseSixiang(ws) {
  return sheetRows(ws)
    .map(normalizeKeys)
    .filter((norm) => rowPassesStatus(norm, false))
    .map((row) => ({
      giver: str(row.giver),
      taker: str(row.taker),
      score: num(row.score),
      level: str(row.level),
      relation_code: str(row.relation_code),
      tag: str(row.tag),
      description: str(row.description)
    }))
}

function parseMbtiDimension(ws) {
  return sheetRows(ws)
    .map(normalizeKeys)
    .filter((norm) => rowPassesStatus(norm, false))
    .map((row) => ({
      dimension: str(row.dimension),
      giver: str(row.giver),
      taker: str(row.taker),
      score: num(row.score),
      level: str(row.level),
      relation_code: str(row.relation_code),
      tag: str(row.tag),
      description: str(row.description)
    }))
}

function parseMbtiModifier(ws) {
  return sheetRows(ws)
    .map(normalizeKeys)
    .filter((norm) => rowPassesStatus(norm, false))
    .map((row) => ({
      giver: str(row.giver),
      taker: str(row.taker),
      score_delta: num(row.score_delta),
      level_hint: str(row.level_hint),
      tag: str(row.tag),
      description: str(row.description),
      priority: num(row.priority, 0)
    }))
}

function parseEnvItems(ws) {
  return sheetRows(ws)
    .map(normalizeKeys)
    .filter((norm) => rowPassesStatus(norm, false))
    .map((row) => ({
      item_id: str(row.item_id),
      category: str(row.category),
      item_code: str(row.item_code),
      item_name_zh: str(row.item_name_zh),
      weight: num(row.weight),
      sort: num(row.sort, 0)
    }))
}

function parseEnvScore(ws) {
  return sheetRows(ws)
    .map(normalizeKeys)
    .filter((norm) => rowPassesStatus(norm, false))
    .map((row) => ({
      overlap_min: num(row.overlap_min),
      overlap_max: num(row.overlap_max),
      score: num(row.score),
      level: str(row.level),
      tag: str(row.tag)
    }))
}

const WEIGHT_KEYS = ['w_wuxing', 'w_mbti', 'w_env', 'w_sixiang']
const MBTI_CONFIG_KEYS = [
  'weight_ei',
  'weight_sn',
  'weight_tf',
  'weight_jp',
  'modifier_enabled',
  'modifier_max_bonus',
  'modifier_max_penalty',
  'default_wuxing_score',
  'default_mbti_score',
  'default_sixiang_score',
  'default_env_score'
]
const ENV_CONFIG_KEYS = ['weight_hobby', 'weight_lifestyle', 'weight_personality', 'weight_comm']

function coerceConfigValue(key, val) {
  if (key === 'modifier_enabled') {
    if (val === true || val === 'true' || val === 1 || val === '1') return true
    if (val === false || val === 'false' || val === 0 || val === '0') return false
    return Boolean(val)
  }
  if (typeof val === 'number' && Number.isFinite(val)) return val
  const n = Number(val)
  return Number.isFinite(n) ? n : val
}

function parseMatchConfig(ws) {
  const weights = {}
  const mbti_config = {}
  const env_config = {}
  const rows = sheetRows(ws).map(normalizeKeys).filter((norm) => rowPassesStatus(norm, true))
  const flat = {}

  for (const norm of rows) {
    const keyCol = norm.key ?? norm.config_key ?? norm.name ?? norm.k
    const valCol = norm.value ?? norm.val ?? norm.config_value ?? norm.v
    if (keyCol != null && String(keyCol).trim() !== '' && valCol !== undefined) {
      flat[str(keyCol)] = valCol
      continue
    }
    for (const [k, v] of Object.entries(norm)) {
      if (k === 'status') continue
      flat[k] = v
    }
  }

  for (const k of Object.keys(flat)) {
    const v = coerceConfigValue(k, flat[k])
    if (WEIGHT_KEYS.includes(k)) weights[k] = v
    else if (MBTI_CONFIG_KEYS.includes(k)) mbti_config[k] = v
    else if (ENV_CONFIG_KEYS.includes(k)) env_config[k] = v
  }

  return { weights, mbti_config, env_config }
}

/**
 * @param workbook XLSX.WorkBook
 * @returns {{ rules: object, weights: object, mbti_config: object, env_config: object }}
 */
export function parseMatchRulesWorkbook(workbook) {
  const wuxing = parseWuxing(findSheet(workbook, 'wuxing_rules'))
  const sixiang = parseSixiang(findSheet(workbook, 'sixiang_rules'))
  const mbti_dimension = parseMbtiDimension(findSheet(workbook, 'mbti_dimension_rules'))
  const mbti_modifier = parseMbtiModifier(findSheet(workbook, 'mbti_modifier_rules'))
  const env_items = parseEnvItems(findSheet(workbook, 'env_items'))
  const env_score = parseEnvScore(findSheet(workbook, 'env_score_rules'))
  const { weights, mbti_config, env_config } = parseMatchConfig(findSheet(workbook, 'match_config'))

  return {
    rules: {
      wuxing,
      sixiang,
      mbti_dimension,
      mbti_modifier,
      env_items,
      env_score
    },
    weights,
    mbti_config,
    env_config
  }
}
