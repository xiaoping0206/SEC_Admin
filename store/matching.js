import { defineStore } from 'pinia'
import { ref } from 'vue'

function unwrapCallResult(res) {
  const r = res?.result
  if (!r || typeof r !== 'object') return null
  return r
}

export const useMatchingStore = defineStore('matching', () => {
  /** 已选老人完整对象 */
  const selectedTaker = ref(null)
  /** 已选护工完整对象 */
  const selectedGiver = ref(null)
  /** 'multi' | 'single' */
  const matchMode = ref('multi')
  /** match-engine 返回的匹配结果数组 */
  const results = ref([])
  /** 当前执行匹配的老人快照 */
  const currentTaker = ref(null)

  const lastResults = ref([])

  function setMatchMode(mode) {
    matchMode.value = mode === 'single' ? 'single' : 'multi'
  }

  function setSelectedTaker(doc) {
    selectedTaker.value = doc
  }

  function setSelectedGiver(doc) {
    selectedGiver.value = doc
  }

  /**
   * 调用云函数 match-engine；多人匹配不传 giverId，单人匹配传 giverId
   */
  async function executeMatch() {
    const tid = selectedTaker.value?._id
    if (!tid) throw new Error('请先选择老人')
    const isSingle = matchMode.value === 'single'
    const gid = selectedGiver.value?._id
    if (isSingle && !gid) throw new Error('请先选择护理员')

    const data = { takerId: tid }
    if (isSingle && gid) data.giverId = gid

    const res = await uniCloud.callFunction({
      name: 'match-engine',
      data
    })
    const payload = unwrapCallResult(res)
    if (!payload) {
      throw new Error('匹配服务无响应')
    }
    const code = payload.code
    if (code !== undefined && code !== 0) {
      throw new Error(payload.msg || '匹配失败')
    }
    let list = Array.isArray(payload.data) ? payload.data : []
    if (isSingle && gid) {
      list = list.filter((row) => String(row.giver_id) === String(gid))
      if (!list.length) {
        throw new Error('单人匹配结果异常，请重试')
      }
    }
    results.value = list
    currentTaker.value = selectedTaker.value
    lastResults.value = results.value
    return results.value
  }

  /** 遗留：按需查询已落库的匹配明细 */
  async function getResult(takerId, giverId) {
    const res = await uniCloud.callFunction({
      name: 'match-engine',
      data: { takerId, giverId, action: 'getResult' }
    })
    const payload = unwrapCallResult(res)
    if (!payload || (payload.code !== undefined && payload.code !== 0)) {
      throw new Error(payload?.msg || '查询失败')
    }
    return payload.data
  }

  /** 遗留：单人跑全量列表（不推荐） */
  async function run(takerId) {
    const res = await uniCloud.callFunction({
      name: 'match-engine',
      data: { takerId }
    })
    const payload = unwrapCallResult(res)
    lastResults.value = payload?.data ?? []
    return payload?.data
  }

  return {
    selectedTaker,
    selectedGiver,
    matchMode,
    results,
    currentTaker,
    lastResults,
    setMatchMode,
    setSelectedTaker,
    setSelectedGiver,
    executeMatch,
    run,
    getResult
  }
})
