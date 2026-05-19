<template>
  <view class="page">
    <view class="header-row">
      <text class="section-title">规则版本</text>
      <button class="btn-link" @tap="goUpload">上传规则</button>
    </view>

    <view v-if="loading" class="loading-wrap">
      <uni-load-more status="loading" />
    </view>

    <template v-else>
      <EmptyState v-if="versions.length === 0" message="尚未上传任何规则版本" />
      <view v-else class="list">
        <view v-for="v in versions" :key="v._id" class="card">
          <view class="card-head">
            <text class="ver">{{ v.version }}</text>
            <view
              class="tag"
              :class="v.is_active ? 'tag-on' : 'tag-off'"
            >
              {{ v.is_active ? '当前使用' : '未激活' }}
            </view>
          </view>
          <text class="meta">上传时间：{{ formatDate(v.upload_date) }}</text>
          <text class="meta">规则条数：{{ totalRuleCount(v) }}</text>
          <view class="card-actions">
            <button
              class="btn-activate"
              :class="{ 'is-disabled': v.is_active }"
              :disabled="v.is_active"
              @tap="onActivateTap(v)"
            >
              激活
            </button>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'

const loading = ref(true)
const versions = ref([])

function totalRuleCount(doc) {
  const r = doc.rules || {}
  const keys = ['wuxing', 'sixiang', 'mbti_dimension', 'mbti_modifier', 'env_items', 'env_score']
  return keys.reduce((sum, k) => {
    const arr = r[k]
    return sum + (Array.isArray(arr) ? arr.length : 0)
  }, 0)
}

onMounted(() => {
  loadVersions()
})

async function loadVersions() {
  loading.value = true
  try {
    const uploadRules = uniCloud.importObject('upload-matching-rules')
    const res = await uploadRules.getRuleVersionList()
    versions.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    versions.value = []
    const msg = parseCloudError(err)
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    loading.value = false
  }
}

function parseCloudError(err) {
  const raw = err?.message ?? ''
  try {
    const j = JSON.parse(raw)
    if (j.msg) return j.msg
  } catch (_) {
    /* ignore */
  }
  return raw || '加载失败'
}

function onActivateTap(row) {
  if (row.is_active) return
  uni.showModal({
    title: '确认激活',
    content: `将规则版本「${row.version}」设为当前使用？`,
    success: async (res) => {
      if (!res.confirm) return
      try {
        const uploadRules = uniCloud.importObject('upload-matching-rules')
        await uploadRules.activateVersion({ id: row._id })
        uni.showToast({ title: '已激活', icon: 'success' })
        await loadVersions()
      } catch (err) {
        uni.showToast({ title: parseCloudError(err), icon: 'none' })
      }
    }
  })
}

function goUpload() {
  uni.navigateTo({ url: '/pages/admin/upload-rules' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  padding: $page-padding-y $page-padding-x;
  padding-bottom: calc(#{$spacing-xl} + #{$bottom-safe-area});
  background: $color-bg;
  min-height: 100vh;
  box-sizing: border-box;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-lg;

  .section-title {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }

  .btn-link {
    background: $color-primary;
    color: #fff;
    border-radius: $radius-full;
    font-size: $font-size-sm;
    padding: $spacing-xs $spacing-md;
    border: none;
    line-height: 1.4;
  }
}

.loading-wrap {
  padding: $spacing-xl 0;
}

.list {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.card {
  background: $color-surface;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
}

.card-head {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;

  .ver {
    font-size: $font-size-md;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
    flex: 1;
    min-width: 0;
    word-break: break-all;
  }
}

.tag {
  flex-shrink: 0;
  font-size: $font-size-xs;
  padding: 6rpx $spacing-sm;
  border-radius: $radius-full;
  font-weight: $font-weight-medium;
}

.tag-on {
  background: rgba($color-success, 0.15);
  color: $color-success;
}

.tag-off {
  background: $color-bg;
  color: $color-text-disabled;
}

.meta {
  display: block;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin-bottom: $spacing-xs;
  line-height: $line-height-base;
}

.card-actions {
  margin-top: $spacing-md;
  display: flex;
  justify-content: flex-end;
}

.btn-activate {
  min-width: 160rpx;
  height: 64rpx;
  line-height: 64rpx;
  padding: 0 $spacing-lg;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  border-radius: $radius-full;
  background: $color-primary;
  color: #fff;
  border: none;

  &.is-disabled,
  &[disabled] {
    background: $color-border;
    color: $color-text-disabled;
  }
}
</style>
