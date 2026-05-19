<template>
  <view class="page">
    <u-navbar
      title="个人信息"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      right-text="编辑"
      bg-color="#ffffff"
      @click-right="goEdit"
      :auto-back="true"
      left-icon="arrow-left"
    />

    <view v-if="loading" class="state">
      <text class="muted">加载中…</text>
    </view>

    <scroll-view v-else-if="detail" scroll-y class="scroll" :style="{ height: scrollH + 'px' }">
      <view class="pad">
        <view class="row">
          <text class="row__l">姓名</text>
          <text class="row__v">{{ detail.name || '—' }}</text>
        </view>
        <view class="row">
          <text class="row__l">性别</text>
          <text class="row__v">{{ genderText }}</text>
        </view>
        <view class="row">
          <text class="row__l">生日</text>
          <text class="row__v">{{ birthText }}</text>
        </view>
        <view class="row">
          <text class="row__l">五行</text>
          <text class="row__v">{{ wxText }}</text>
        </view>
        <view class="row">
          <text class="row__l">星座</text>
          <text class="row__v">{{ constellationText }}</text>
        </view>
        <view class="row">
          <text class="row__l">四象</text>
          <text class="row__v">{{ sxText }}</text>
        </view>
        <view class="row">
          <text class="row__l">MBTI</text>
          <text class="row__v">{{ detail.mbti || '—' }}</text>
        </view>
        <view class="row">
          <text class="row__l">工龄</text>
          <text class="row__v">{{ expText }}</text>
        </view>

        <text class="field-hint">生活环境标签</text>
        <view class="chip-wrap">
          <text v-if="flatTags.length === 0" class="muted">暂无</text>
          <text v-for="(c, i) in flatTags" :key="'tg-' + i" class="chip">{{ c }}</text>
        </view>

        <view class="row">
          <text class="row__l">擅长方向</text>
          <text class="row__v">{{ qualificationText }}</text>
        </view>
        <view class="row">
          <text class="row__l">服务数量（当前 / 最大）</text>
          <text class="row__v">{{ svcText }}</text>
        </view>
        <view class="row">
          <text class="row__l">状态</text>
          <text class="row__v">{{ statusZh }}</text>
        </view>
      </view>
    </scroll-view>

    <view v-else-if="!loading" class="state">
      <text class="muted">未找到档案</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { labelGender } from '@/utils/person-labels.js'
import { formatWuxing, formatBirthday, normalizeBirthday, sixiangLabel } from '@/utils/format.js'
import { calcSixiangFromBirthday } from '@/utils/lunar.js'
import { toastCloudError } from '@/utils/cloud-error.js'
import { unwrapCloudObjectData } from '@/utils/cloud-result.js'
import { useRulesStore } from '@/store/rules.js'
import { envTagsToDisplayList } from '@/utils/env-tags.js'

const STATUS_MAP = { active: '有效', inactive: '停用', archived: '归档' }

const id = ref('')
const loading = ref(true)
const detail = ref(null)
const scrollH = ref(500)
const rulesStore = useRulesStore()

onLoad((opts) => {
  id.value = (opts && opts.id) || ''
})

const genderText = computed(() => labelGender(detail.value?.gender))

const birthText = computed(() => formatBirthday(detail.value?.birthday))

const constellationText = computed(() => {
  const d = detail.value
  if (!d) return '—'
  const s = d.constellation
  if (s != null && String(s).trim()) return String(s).trim()
  const b = normalizeBirthday(d.birthday)
  const mo = b?.solar?.month
  const dy = b?.solar?.day
  if (mo != null && dy != null) {
    const { constellation } = calcSixiangFromBirthday(mo, dy)
    return constellation || '—'
  }
  return '—'
})

const wxText = computed(() => formatWuxing(detail.value?.wuxing))
const sxText = computed(() => sixiangLabel(detail.value?.sixiang))

const expText = computed(() => {
  const y = detail.value?.experience_years
  return typeof y === 'number' && !Number.isNaN(y) ? `${y} 年` : '—'
})

const qualificationText = computed(() => {
  const q = String(detail.value?.qualification || '').trim()
  return q || '—'
})

const svcText = computed(() => {
  const d = detail.value
  if (!d) return '—'
  const cur = typeof d.current_taker_count === 'number' ? d.current_taker_count : 0
  const mx = typeof d.max_taker_count === 'number' ? d.max_taker_count : 5
  return `${cur} / ${mx}`
})

const flatTags = computed(() =>
  envTagsToDisplayList(detail.value?.env_tags, rulesStore.envTagGroups)
)

const statusZh = computed(() => {
  const s = detail.value?.status
  return s && STATUS_MAP[s] ? STATUS_MAP[s] : '有效'
})

function layout() {
  const s = uni.getSystemInfoSync()
  const nav = (s.statusBarHeight || 20) + 44
  scrollH.value = Math.max(200, s.windowHeight - nav)
}

async function load() {
  if (!id.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    await rulesStore.fetchActiveEnvTags()
    const gm = uniCloud.importObject('giver-manager')
    const res = await gm.getGiverDetail({ id: id.value })
    detail.value = unwrapCloudObjectData(res)
  } catch (e) {
    toastCloudError(e)
    detail.value = null
  } finally {
    loading.value = false
  }
}

onShow(async () => {
  layout()
  if (id.value) await load()
})

function goEdit() {
  if (!id.value) return
  uni.navigateTo({ url: `/pages/giver/edit?id=${id.value}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.scroll {
  width: 100%;
}

.pad {
  padding: 24rpx $page-padding-x 48rpx;
}

.sect {
  display: block;
  font-size: 22rpx;
  color: $color-text-secondary;
  margin-bottom: 12rpx;
}

.sect--mt {
  margin-top: 28rpx;
}

.field-hint {
  display: block;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 20rpx 0 12rpx;
}

.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22rpx 0;
  border-bottom: 1rpx solid $color-border;
  background: #fff;
}

.row__l {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  flex-shrink: 0;
  margin-right: 24rpx;
  max-width: 46%;
}

.row__v {
  flex: 1;
  font-size: $font-size-base;
  color: $color-text-primary;
  text-align: right;
}

.chip-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.chip {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(74, 144, 226, 0.12);
  color: #4a90e2;
}

.state {
  padding: 120rpx 24rpx;
}

.muted {
  font-size: $font-size-base;
  color: $color-text-secondary;
}
</style>
