import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  buildEnvTagGroups,
  buildLabelLookup,
  ENV_CATEGORY_ORDER,
  getEnvTagLabel
} from '@/utils/env-tags.js'

const EMPTY_GROUPS = () =>
  ENV_CATEGORY_ORDER.map((key) => ({
    key,
    tabLabel: key,
    tags: []
  }))

export const useRulesStore = defineStore('rules', () => {
  const envTagGroups = ref(EMPTY_GROUPS())
  const activeVersionId = ref('')
  const activeVersion = ref('')
  const loading = ref(false)
  const loaded = ref(false)
  const loadError = ref('')

  const labelLookup = computed(() => buildLabelLookup(envTagGroups.value))

  function getLabel(category, code) {
    return getEnvTagLabel(envTagGroups.value, category, code)
  }

  /**
   * 拉取当前激活规则版本的环境标签
   * @returns {Promise<boolean>} 版本是否相对上次有变化
   */
  async function fetchActiveEnvTags({ force = false } = {}) {
    if (loading.value && !force) return false
    loading.value = true
    loadError.value = ''
    try {
      const uploadRules = uniCloud.importObject('upload-matching-rules')
      const res = await uploadRules.getActiveEnvTags()
      const data = res?.data ?? {}
      const nextId = data.version_id || ''
      const changed = nextId !== activeVersionId.value || force

      activeVersionId.value = nextId
      activeVersion.value = data.version || ''
      envTagGroups.value = Array.isArray(data.groups) && data.groups.length
        ? data.groups
        : EMPTY_GROUPS()
      loaded.value = true
      return changed
    } catch (e) {
      const raw = String(e?.message || e?.errMsg || '')
      if (raw.includes('getActiveEnvTags') && raw.includes('not found')) {
        loadError.value =
          '云函数未更新：请在 HBuilderX 上传 upload-matching-rules 云对象'
      } else {
        loadError.value = raw || '标签加载失败'
      }
      if (!loaded.value) {
        envTagGroups.value = EMPTY_GROUPS()
      }
      return false
    } finally {
      loading.value = false
    }
  }

  function invalidate() {
    activeVersionId.value = ''
    loaded.value = false
  }

  return {
    envTagGroups,
    activeVersionId,
    activeVersion,
    loading,
    loaded,
    loadError,
    labelLookup,
    getLabel,
    fetchActiveEnvTags,
    invalidate
  }
})
