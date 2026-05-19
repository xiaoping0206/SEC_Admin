'use strict'

const db  = uniCloud.database()
const col = db.collection('matching_rule_versions')

function _err(code, msg) {
  throw new Error(JSON.stringify({ code, msg }))
}

// ─── Default config values ───────────────────────────────────────────────────

const DEFAULT_WEIGHTS = {
  w_wuxing:  0.40,
  w_mbti:    0.25,
  w_env:     0.20,
  w_sixiang: 0.15
}

const DEFAULT_MBTI_CONFIG = {
  weight_ei: 0.20,
  weight_sn: 0.20,
  weight_tf: 0.30,
  weight_jp: 0.30,
  modifier_enabled:     true,
  modifier_max_bonus:   10,
  modifier_max_penalty: -10,
  default_wuxing_score:  60,
  default_mbti_score:    60,
  default_sixiang_score: 60,
  default_env_score:     60
}

const DEFAULT_ENV_CONFIG = {
  weight_hobby:       0.25,
  weight_lifestyle:   0.30,
  weight_personality: 0.25,
  weight_comm:        0.20
}

function mergeDefaults(defaults, override = {}) {
  const out = { ...defaults }
  for (const k of Object.keys(defaults)) {
    if (override[k] !== undefined) out[k] = override[k]
  }
  return out
}

const ENV_CATEGORY_ORDER = ['hobby', 'lifestyle', 'personality', 'comm_style']
const ENV_CATEGORY_LABELS = {
  hobby: '兴趣爱好',
  lifestyle: '生活方式',
  personality: '性格特征',
  comm_style: '沟通偏好'
}

function buildEnvTagGroups(envItems = []) {
  const bucket = {}
  for (const key of ENV_CATEGORY_ORDER) bucket[key] = []

  for (const row of envItems) {
    const cat = String(row?.category ?? '').trim()
    if (!bucket[cat]) continue
    const code = String(row?.item_code ?? '').trim()
    const label = String(row?.item_name_zh ?? row?.label ?? '').trim()
    if (!code || !label) continue
    bucket[cat].push({ code, label, sort: Number(row?.sort) || 0 })
  }

  return ENV_CATEGORY_ORDER.map((key) => ({
    key,
    tabLabel: ENV_CATEGORY_LABELS[key] || key,
    tags: bucket[key].sort(
      (a, b) => a.sort - b.sort || a.label.localeCompare(b.label, 'zh-CN')
    )
  }))
}

module.exports = {
  _before() {
    // Hook point: admin role check can be added here in STEP 6
  },

  /**
   * 上传新规则版本（前端解析 Excel 后传入完整 JSON）
   *
   * @param {string}  version     - 版本号（必填，如 V1.0）
   * @param {string}  description - 版本说明（可选）
   * @param {boolean} overwrite   - 是否覆盖同 version 的旧记录（默认 false）
   * @param {object}  rules       - 6类规则数组
   * @param {object}  weights     - 四维度权重
   * @param {object}  mbti_config - MBTI 维度权重 / 修正项配置 / 各维度默认分
   * @param {object}  env_config  - 环境四类别权重
   * @param {string}  file_name   - 原始 Excel 文件名（可选）
   */
  async uploadRules({
    version,
    description = '',
    overwrite   = false,
    rules       = {},
    weights     = {},
    mbti_config = {},
    env_config  = {},
    file_name   = ''
  } = {}) {
    if (!version?.trim()) _err(-1000, '参数错误：版本号必填')

    const v = version.trim()

    // Check duplicate version
    const existing = await col.where({ version: v }).get()
    if (existing.data.length) {
      if (!overwrite) {
        _err(-1003, '版本已存在，请开启版本覆盖')
      }
      // overwrite=true: physically remove old records of this version
      // (schema-level delete:false applies to clientDB only; server can remove)
      await col.where({ version: v }).remove()
    }

    const clientInfo = this.getClientInfo()
    const uploadedBy = clientInfo?.uid ?? ''
    const now        = Date.now()

    const payload = {
      version:     v,
      description,
      is_active:   false,
      ...(file_name && String(file_name).trim()
        ? { file_name: String(file_name).trim().slice(0, 100) }
        : {}),
      weights:     mergeDefaults(DEFAULT_WEIGHTS,     weights),
      mbti_config: mergeDefaults(DEFAULT_MBTI_CONFIG, mbti_config),
      env_config:  mergeDefaults(DEFAULT_ENV_CONFIG,  env_config),
      rules: {
        wuxing:         Array.isArray(rules.wuxing)         ? rules.wuxing         : [],
        sixiang:        Array.isArray(rules.sixiang)        ? rules.sixiang        : [],
        mbti_dimension: Array.isArray(rules.mbti_dimension) ? rules.mbti_dimension : [],
        mbti_modifier:  Array.isArray(rules.mbti_modifier)  ? rules.mbti_modifier  : [],
        env_items:      Array.isArray(rules.env_items)      ? rules.env_items      : [],
        env_score:      Array.isArray(rules.env_score)      ? rules.env_score      : []
      },
      uploaded_by: uploadedBy,
      upload_date: now
    }

    const res = await col.add(payload)
    return { code: 0, msg: 'success', data: { id: res.id, version: v } }
  },

  /**
   * 获取所有规则版本列表（按上传时间倒序）
   */
  async getRuleVersionList() {
    const res = await col
      .orderBy('upload_date', 'desc')
      .get()
    return { code: 0, msg: 'success', data: res.data }
  },

  /**
   * 激活指定规则版本
   * 先批量将所有版本 is_active 设为 false，再激活目标版本
   *
   * @param {string} id - 要激活的版本文档ID（必填）
   */
  async activateVersion({ id } = {}) {
    if (!id) _err(-1000, '参数错误：缺少 id')

    const target = await col.doc(id).get()
    if (!target.data.length) _err(-1001, '版本不存在')

    await col.where({ is_active: true }).update({ is_active: false })
    await col.doc(id).update({ is_active: true })

    return { code: 0, msg: 'success' }
  },

  /**
   * 获取规则版本详情（含完整 rules 数据）
   * @param {string} id - 版本文档ID（必填）
   */
  async getRuleVersionDetail({ id } = {}) {
    if (!id) _err(-1000, '参数错误：缺少 id')

    const res = await col.doc(id).get()
    if (!res.data.length) _err(-1001, '版本不存在')

    return { code: 0, msg: 'success', data: res.data[0] }
  },

  /**
   * 删除指定规则版本（不可删除当前激活版本）
   * @param {string} id - 版本文档ID（必填）
   */
  async deleteVersion({ id } = {}) {
    if (!id) _err(-1000, '参数错误：缺少 id')

    const target = await col.doc(id).get()
    if (!target.data.length) _err(-1001, '版本不存在')
    if (target.data[0].is_active) _err(-1002, '当前使用中的版本不可删除')

    await col.doc(id).remove()
    return { code: 0, msg: 'success' }
  },

  /**
   * 获取当前激活版本的生活环境标签（供填写资料页动态渲染）
   */
  async getActiveEnvTags() {
    const res = await col.where({ is_active: true }).limit(1).get()
    if (!res.data.length) {
      return {
        code: 0,
        msg: 'success',
        data: {
          version_id: '',
          version: '',
          groups: buildEnvTagGroups([])
        }
      }
    }

    const doc = res.data[0]
    const envItems = doc.rules?.env_items ?? []

    return {
      code: 0,
      msg: 'success',
      data: {
        version_id: doc._id,
        version: doc.version || '',
        groups: buildEnvTagGroups(envItems)
      }
    }
  }
}
