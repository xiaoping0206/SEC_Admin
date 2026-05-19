'use strict'

const db = uniCloud.database()

// ─── Entry point ─────────────────────────────────────────────────────────────

/**
 * match-engine Cloud Function
 *
 * event.action === 'getResult'  → 查询已存储的匹配结果
 * (default)                     → 对指定老人执行全量匹配并持久化结果
 *
 * @param {{ takerId: string, giverId?: string, action?: string }} event
 * giverId 可选：传入时仅计算该护工与老人的一对一结果（单人匹配）
 */
exports.main = async (event) => {
  try {
    const { takerId, giverId, action } = event || {}

    if (action === 'getResult') {
      if (!takerId) _err(-1000, '参数错误：缺少 takerId')
      if (!giverId) _err(-1000, '参数错误：缺少 giverId')
      return await getStoredResult(takerId, giverId)
    }

    return await runMatching(takerId, giverId)
  } catch (e) {
    let parsed
    try { parsed = JSON.parse(e.message) } catch (_) { parsed = null }
    if (parsed?.code) throw e
    throw new Error(JSON.stringify({ code: -2001, msg: e.message ?? '匹配失败' }))
  }
}

// ─── Core matching pipeline ──────────────────────────────────────────────────

async function runMatching(takerId, giverId) {
  if (!takerId) _err(-1000, '参数错误：缺少 takerId')

  const [takerRes, ruleRes] = await Promise.all([
    db.collection('taker').doc(takerId).get(),
    db.collection('matching_rule_versions').where({ is_active: true }).limit(1).get()
  ])

  if (!takerRes.data.length) _err(-1001, '老人数据不存在')
  if (!ruleRes.data.length)  _err(-2001, '未找到激活的匹配规则，请先在管理页面激活一个规则版本')

  const taker = takerRes.data[0]

  /** @type {Array} */
  let givers
  if (giverId) {
    const gDoc = await db.collection('giver').doc(giverId).get()
    if (!gDoc.data.length) _err(-1001, '护工不存在')
    if (gDoc.data[0].is_deleted) _err(-1002, '护工不可用')
    givers = [gDoc.data[0]]
  } else {
    const giverRes = await db.collection('giver').where({ is_deleted: false }).get()
    givers = giverRes.data
  }

  if (!givers.length) _err(-2001, '暂无可匹配的护工')

  const rule = ruleRes.data[0]

  // Extract rule sub-collections and configs
  const wuxingRules    = rule.rules?.wuxing         ?? []
  const sixiangRules   = rule.rules?.sixiang        ?? []
  const dimensionRules = rule.rules?.mbti_dimension ?? []
  const modifierRules  = rule.rules?.mbti_modifier  ?? []
  const envItems       = rule.rules?.env_items      ?? []
  const envScoreRules  = rule.rules?.env_score      ?? []

  const weights     = rule.weights     ?? {}
  const mbtiConfig  = rule.mbti_config ?? {}
  const envConfig   = rule.env_config  ?? {}

  // Compute per-giver scores
  const results = givers.map(giver => {
    const wuxing_score  = calcWuxingScore (taker, giver, wuxingRules,    mbtiConfig.default_wuxing_score  ?? 60)
    const sixiang_score = calcSixiangScore(taker, giver, sixiangRules,   mbtiConfig.default_sixiang_score ?? 60)
    const mbti_score    = calcMbtiScore   (taker, giver, dimensionRules, modifierRules, mbtiConfig)
    const env_score     = calcEnvScore    (taker, giver, envItems,       envScoreRules, envConfig)

    const scores = { wuxing_score, mbti_score, env_score, sixiang_score }
    const total  = calcTotal(scores, weights)

    return {
      giver_id:    giver._id,
      giver_name:  giver.name,
      scores,
      total_score: total,
      match_grade: gradeOf(total)
    }
  })

  // Sort descending by total score
  results.sort((a, b) => b.total_score - a.total_score)

  // Persist all scored pairs
  const now = Date.now()
  await Promise.all(
    results.map(r =>
      db.collection('matching_results').add({
        taker_id:        takerId,
        giver_id:        r.giver_id,
        rule_version:    rule.version,
        rule_version_id: rule._id,
        scores:          r.scores,
        total_score:     r.total_score,
        match_grade:     r.match_grade,
        matched_date:    now,
        status:          'active'
      })
    )
  )

  return { code: 0, msg: 'success', data: results }
}

async function getStoredResult(takerId, giverId) {
  const res = await db.collection('matching_results')
    .where({ taker_id: takerId, giver_id: giverId, status: 'active' })
    .orderBy('matched_date', 'desc')
    .limit(1)
    .get()

  if (!res.data.length) _err(-1001, '匹配结果不存在，请重新执行匹配')

  return { code: 0, msg: 'success', data: res.data[0] }
}

// ─── Total score & grade ─────────────────────────────────────────────────────

/**
 * 综合总分公式：五行×0.40 + MBTI×0.25 + 环境×0.20 + 四象×0.15
 * 保留小数点后1位四舍五入
 */
function calcTotal(scores, weights) {
  const raw =
    scores.wuxing_score  * (weights.w_wuxing  ?? 0.40) +
    scores.mbti_score    * (weights.w_mbti    ?? 0.25) +
    scores.env_score     * (weights.w_env     ?? 0.20) +
    scores.sixiang_score * (weights.w_sixiang ?? 0.15)
  return Math.round(raw * 10) / 10
}

/**
 * 等级判定：S（90~）/ A（75~）/ B（60~）/ C（45~）/ D（~44）
 */
function gradeOf(score) {
  if (score >= 90) return 'S'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 45) return 'C'
  return 'D'
}

// ─── Dimension scoring ───────────────────────────────────────────────────────

/**
 * 五行适配度（权重 40%）
 * 在 wuxingRules 中查找 giver=giver.wuxing AND taker=taker.wuxing 的记录
 * 找到则返回该 score；未找到返回 defaultScore
 */
function calcWuxingScore(taker, giver, wuxingRules, defaultScore) {
  if (!taker.wuxing || !giver.wuxing) return defaultScore

  const matched = wuxingRules.find(r =>
    r.giver === giver.wuxing && r.taker === taker.wuxing
  )
  return matched?.score ?? defaultScore
}

/**
 * 四象情绪互动适配度（权重 15%）
 * 在 sixiangRules 中查找 giver=giver.sixiang AND taker=taker.sixiang 的记录
 * 找到则返回该 score；未找到返回 defaultScore
 */
function calcSixiangScore(taker, giver, sixiangRules, defaultScore) {
  if (!taker.sixiang || !giver.sixiang) return defaultScore

  const matched = sixiangRules.find(r =>
    r.giver === giver.sixiang && r.taker === taker.sixiang
  )
  return matched?.score ?? defaultScore
}

/**
 * MBTI 行为沟通适配度（权重 25%）
 *
 * 1. 将 giver.mbti / taker.mbti 拆分为 EI/SN/TF/JP 四个维度字母
 * 2. 按 weight_ei/sn/tf/jp 分别在 dimensionRules 中查找对应 score，加权求和得基础分
 * 3. 若 modifier_enabled=true，在 modifierRules 中查找
 *    giver=giver.mbti AND taker=taker.mbti 的记录，取 score_delta
 *    delta clamp 在 [modifier_max_penalty, modifier_max_bonus]
 * 4. 最终 = 基础分 + delta，clamp 在 [0, 100]
 */
function calcMbtiScore(taker, giver, dimensionRules, modifierRules, mbtiConfig) {
  const giverMbti = giver.mbti ?? ''
  const takerMbti = taker.mbti ?? ''
  const fallback  = mbtiConfig.default_mbti_score ?? 60

  if (giverMbti.length !== 4 || takerMbti.length !== 4) return fallback

  const DIMS = [
    { code: 'EI', idx: 0, weight: mbtiConfig.weight_ei ?? 0.20 },
    { code: 'SN', idx: 1, weight: mbtiConfig.weight_sn ?? 0.20 },
    { code: 'TF', idx: 2, weight: mbtiConfig.weight_tf ?? 0.30 },
    { code: 'JP', idx: 3, weight: mbtiConfig.weight_jp ?? 0.30 }
  ]

  // Base score: weighted sum across 4 dimensions
  let base = 0
  DIMS.forEach(({ code, idx, weight }) => {
    const giverChar = giverMbti[idx]
    const takerChar = takerMbti[idx]
    const matched   = dimensionRules.find(r =>
      r.dimension === code && r.giver === giverChar && r.taker === takerChar
    )
    const dimScore = matched?.score ?? fallback
    base += dimScore * weight
  })

  // Modifier: clamped score_delta
  let delta = 0
  if (mbtiConfig.modifier_enabled) {
    const mod = modifierRules.find(r =>
      r.giver === giverMbti && r.taker === takerMbti
    )
    if (mod) {
      const minPenalty = mbtiConfig.modifier_max_penalty ?? -10
      const maxBonus   = mbtiConfig.modifier_max_bonus   ?? 10
      const rawDelta   = mod.score_delta ?? 0
      delta = Math.max(minPenalty, Math.min(maxBonus, rawDelta))
    }
  }

  const total = base + delta
  return Math.round(Math.max(0, Math.min(100, total)) * 10) / 10
}

/**
 * 生活环境适配度（权重 20%）
 *
 * 按 4 类别分别计算：
 *   重叠率 = 共同选择的 item_code 数 / min(老人选择数, 护理员选择数)
 *   在 envScoreRules 中找 overlap_min <= 重叠率 <= overlap_max 的记录，取其 score
 *
 * 类别加权：
 *   hobby × weight_hobby + lifestyle × weight_lifestyle
 *   + personality × weight_personality + comm_style × weight_comm
 *
 */
function resolveEnvItemCodes(tags, category, envItems) {
  const arr = Array.isArray(tags?.[category]) ? tags[category] : []
  const catItems = (envItems || []).filter(
    (i) => String(i?.category ?? '').trim() === category
  )
  const codes = new Set()
  const out = []

  for (const v of arr) {
    const s = String(v ?? '').trim()
    if (!s) continue
    let code = s
    const byCode = catItems.find((i) => String(i.item_code ?? '').trim() === s)
    if (byCode) {
      code = String(byCode.item_code).trim()
    } else {
      const byLabel = catItems.find(
        (i) => String(i.item_name_zh ?? i.label ?? '').trim() === s
      )
      if (byLabel) code = String(byLabel.item_code ?? '').trim()
    }
    if (!code || codes.has(code)) continue
    codes.add(code)
    out.push(code)
  }
  return out
}

function calcEnvScore(taker, giver, envItems, envScoreRules, envConfig) {
  const takerTags = taker.env_tags ?? {}
  const giverTags = giver.env_tags ?? {}

  // env_tags category → envConfig weight key
  const CATEGORY_WEIGHTS = {
    hobby:       envConfig.weight_hobby       ?? 0.25,
    lifestyle:   envConfig.weight_lifestyle   ?? 0.30,
    personality: envConfig.weight_personality ?? 0.25,
    comm_style:  envConfig.weight_comm        ?? 0.20
  }

  let total = 0

  Object.entries(CATEGORY_WEIGHTS).forEach(([cat, weight]) => {
    const takerItems = resolveEnvItemCodes(takerTags, cat, envItems)
    const giverItems = resolveEnvItemCodes(giverTags, cat, envItems)

    const overlapCount = takerItems.filter(v => giverItems.includes(v)).length
    const minCount     = Math.min(takerItems.length, giverItems.length)
    const ratio        = minCount === 0 ? 0 : overlapCount / minCount

    const matched  = envScoreRules.find(r =>
      ratio >= (r.overlap_min ?? 0) && ratio <= (r.overlap_max ?? 1)
    )
    const catScore = matched?.score ?? 0

    total += catScore * weight
  })

  return Math.round(total * 10) / 10
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function _err(code, msg) {
  throw new Error(JSON.stringify({ code, msg }))
}
