import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGiverStore = defineStore('giver', () => {
  const list    = ref([])
  const loading = ref(false)

  const _obj = () => uniCloud.importObject('giver-manager')

  async function fetchList(params = {}) {
    loading.value = true
    try {
      const res = await _obj().getGiverList(params)
      list.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchDetail(id) {
    const res = await _obj().getGiverDetail({ id })
    return res.data
  }

  async function add(data) {
    await _obj().addGiver(data)
    await fetchList()
  }

  async function update(id, data) {
    await _obj().updateGiver({ id, ...data })
    await fetchList()
  }

  async function remove(id) {
    await _obj().deleteGiver({ id })
    await fetchList()
  }

  return { list, loading, fetchList, fetchDetail, add, update, remove }
})
