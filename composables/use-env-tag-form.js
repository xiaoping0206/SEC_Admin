import { computed } from 'vue'
import { useRulesStore } from '@/store/rules.js'
import {
  ENV_CATEGORY_LABELS,
  normalizeStoredEnvTags
} from '@/utils/env-tags.js'

/**
 * 填写资料 / 编辑页：生活环境标签选择与 env_tags（存 item_code）
 * @param {import('vue').Reactive<{ hobby, lifestyle, personality, comm_style }>} formEnvTags
 * @param {import('vue').Ref<string>} envTabRef
 */
export function useEnvTagForm(formEnvTags, envTabRef) {
  const rulesStore = useRulesStore()

  const envGroups = computed(() => rulesStore.envTagGroups)

  const currentEnvTags = computed(() => {
    const g = envGroups.value.find((x) => x.key === envTabRef.value)
    return g?.tags ?? []
  })

  function getCategoryName(cat) {
    return ENV_CATEGORY_LABELS[cat] || cat
  }

  function tagOn(key, code) {
    return (formEnvTags[key] || []).includes(code)
  }

  function toggleTag(category, tag) {
    const code = tag?.code
    if (!code) return
    const arr = formEnvTags[category]
    const idx = arr.indexOf(code)
    if (idx !== -1) {
      arr.splice(idx, 1)
      return
    }
    if (arr.length >= 5) {
      uni.showToast({
        title: `${getCategoryName(category)}最多选5个`,
        icon: 'none'
      })
      return
    }
    arr.push(code)
  }

  const pickedTagItems = computed(() => {
    const out = []
    envGroups.value.forEach((g) => {
      ;(formEnvTags[g.key] || []).forEach((code) => {
        const item = g.tags.find((t) => t.code === code)
        out.push({
          key: g.key,
          code,
          label: item?.label || rulesStore.getLabel(g.key, code)
        })
      })
    })
    return out
  })

  function removeTag(key, code) {
    formEnvTags[key] = (formEnvTags[key] || []).filter((x) => x !== code)
  }

  function applyNormalizedEnvTags(raw) {
    const normalized = normalizeStoredEnvTags(raw, envGroups.value)
    for (const k of Object.keys(normalized)) {
      formEnvTags[k] = normalized[k]
    }
  }

  return {
    rulesStore,
    envGroups,
    currentEnvTags,
    tagOn,
    toggleTag,
    pickedTagItems,
    removeTag,
    applyNormalizedEnvTags,
    getCategoryName
  }
}
