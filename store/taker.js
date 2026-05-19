import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTakerStore = defineStore('taker', () => {
  const list    = ref([])
  const loading = ref(false)

  const _obj = () => uniCloud.importObject('taker-manager')

  async function fetchList(params = {}) {
    loading.value = true
    try {
      const res = await _obj().getTakerList(params)
      list.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id) {
    const res = await _obj().getTakerDetail({ id })
    return res.data
  }

  async function add(data) {
    await _obj().addTaker(data)
    await fetchList()
  }

  async function update(id, data) {
    await _obj().updateTaker({ id, ...data })
    await fetchList()
  }

  async function remove(id) {
    await _obj().deleteTaker({ id })
    await fetchList()
  }

  return { list, loading, fetchList, fetchDetail, add, update, remove }
})
