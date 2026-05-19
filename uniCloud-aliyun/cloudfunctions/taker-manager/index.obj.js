'use strict'

const db  = uniCloud.database()
const col = db.collection('taker')

// Fields clients are allowed to write (prevents overwriting system fields)
const WRITABLE_FIELDS = [
  'name',
  'age',
  'gender',
  'contact',
  'care_level',
  'birthday',
  'constellation',
  'chronic_disease',
  'wuxing',
  'sixiang',
  'mbti',
  'env_tags',
  'notes',
  'is_matched',
  'assigned_giver_id',
  'status'
]

function pick(obj, keys) {
  return keys.reduce((acc, k) => {
    if (k in obj) acc[k] = obj[k]
    return acc
  }, {})
}

function err(code, msg) {
  throw new Error(JSON.stringify({ code, msg }))
}

module.exports = {
  _before() {
    // Hook point: auth checks can be added here in STEP 6
  },

  /**
   * 获取老人列表（软删除过滤 + 关键词搜索 + 分页）
   * @param {string}  keyword  - 姓名关键词（可选）
   * @param {number}  page     - 页码，从1开始（默认1）
   * @param {number}  pageSize - 每页条数（默认20）
   */
  async getTakerList({ keyword = '', page = 1, pageSize = 20 } = {}) {
    const whereClause = keyword
      ? { is_deleted: false, name: db.RegExp({ regexp: keyword, options: 'i' }) }
      : { is_deleted: false }

    const res = await col
      .where(whereClause)
      .orderBy('create_date', 'desc')
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .get()

    return { code: 0, msg: 'success', data: res.data }
  },

  /**
   * 获取老人详情
   * @param {string} id - 老人文档ID（必填）
   */
  async getTakerDetail({ id } = {}) {
    if (!id) err(-1000, '参数错误：缺少 id')

    const res = await col.doc(id).get()
    if (!res.data.length) err(-1001, '数据不存在')

    return { code: 0, msg: 'success', data: res.data[0] }
  },

  /**
   * 新增老人
   * @param {object} data - 老人信息（name 必填）
   */
  async addTaker(data = {}) {
    if (!data.name?.trim()) err(-1000, '参数错误：姓名必填')

    const now = Date.now()
    const payload = {
      ...pick(data, WRITABLE_FIELDS),
      name:        data.name.trim(),
      is_matched:  false,
      is_deleted:  false,
      create_date: now,
      update_date: now
    }

    const res = await col.add(payload)
    return { code: 0, msg: 'success', data: { id: res.id } }
  },

  /**
   * 更新老人信息
   * @param {string} id   - 老人文档ID（必填）
   * @param {object} data - 要更新的字段（仅允许可写字段）
   */
  async updateTaker({ id, ...data } = {}) {
    if (!id) err(-1000, '参数错误：缺少 id')

    const payload = {
      ...pick(data, WRITABLE_FIELDS),
      update_date: Date.now()
    }
    if (payload.name !== undefined) payload.name = payload.name.trim()

    await col.doc(id).update(payload)
    return { code: 0, msg: 'success' }
  },

  /**
   * 软删除老人（is_deleted: true）
   * @param {string} id - 老人文档ID（必填）
   */
  async deleteTaker({ id } = {}) {
    if (!id) err(-1000, '参数错误：缺少 id')

    await col.doc(id).update({ is_deleted: true, update_date: Date.now() })
    return { code: 0, msg: 'success' }
  }
}
