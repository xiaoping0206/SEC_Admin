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

    <scroll-view
      v-else-if="detail"
      scroll-y
      class="scroll"
      :style="{ height: scrollH + 'px' }"
    >
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
          <text class="row__l">慢性病史</text>
          <text class="row__v">{{ chronicLine }}</text>
        </view>

        <text class="field-hint">生活环境标签</text>
        <view class="chip-wrap">
          <text v-if="flatTags.length === 0" class="muted">暂无</text>
          <text v-for="(c, i) in flatTags" :key="'tg-' + i" class="chip">{{ c }}</text>
        </view>


        <view class="row">
          <text class="row__l">护理等级</text>
          <text class="row__v">{{ careDisplay }}</text>
        </view>
        <view class="row">
          <text class="row__l">分配护工</text>
          <text class="row__v">{{ assigneeName }}</text>
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

    <view v-if="detail && showMatchBtn" class="foot">
      <button class="cta" @tap="goMatch">开始匹配</button>
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

const CARE_NAMES = ['—', '自理', '轻度', '中度', '重度', '特重']
const STATUS_MAP = { active: '有效', inactive: '停用', archived: '归档' }

const id = ref('')
const loading = ref(true)
const detail = ref(null)
const scrollH = ref(500)
const giverRows = ref([])
/** 避免 onLoad 已拉取后 onShow 再请求一次 */
const skipNextShowDetailFetch = ref(false)

onLoad(async (opts) => {
  id.value = (opts && opts.id) || ''
  if (!id.value) {
    loading.value = false
    return
  }
  skipNextShowDetailFetch.value = true
  await load()
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

const chronicLine = computed(() => {
  const raw = detail.value?.chronic_disease
  if (Array.isArray(raw)) {
    const parts = raw.map((x) => String(x).trim()).filter(Boolean)
    return parts.length ? parts.join('、') : '无'
  }
  const s = String(raw || '').trim()
  if (!s) return '无'
  return s.split(/[,，]/).map((x) => x.trim()).filter(Boolean).join('、') || '无'
})

function flatTagsFromEnv(env) {
  if (!env || typeof env !== 'object') return []
  const out = []
  ;['hobby', 'lifestyle', 'personality', 'comm_style'].forEach((k) => {
    const arr = env[k]
    if (Array.isArray(arr)) out.push(...arr)
  })
  return out
}

const flatTags = computed(() => flatTagsFromEnv(detail.value?.env_tags))

const careDisplay = computed(() => {
  const c = detail.value?.care_level
  if (typeof c !== 'number' || Number.isNaN(c)) return '—'
  const n = Math.round(c)
  return n >= 1 && n <= 5 ? CARE_NAMES[n] : '—'
})

const assigneeName = computed(() => {
  const t = detail.value
  if (!t) return '未匹配'
  const n = String(t.matched_giver_name || '').trim()
  if (n) return n
  const gid = t.assigned_giver_id || t.matched_giver_id || t.linked_giver_id
  if (!gid) return '未匹配'
  const g = giverRows.value.find((x) => x._id === gid)
  return g?.name?.trim() || '—'
})

const statusZh = computed(() => {
  const s = detail.value?.status
  if (s && STATUS_MAP[s]) return STATUS_MAP[s]
  return '有效'
})

const showMatchBtn = computed(() => {
  const t = detail.value
  if (!t) return false
  const st = t.status ?? 'active'
  if (st !== 'active') return false
  return !t.is_matched
})

function layout() {
  const s = uni.getSystemInfoSync()
  const nav = (s.statusBarHeight || 20) + 44
  const foot = uni.upx2px(136)
  scrollH.value = Math.max(200, s.windowHeight - nav - foot)
}

async function loadGivers() {
  try {
    const gm = uniCloud.importObject('giver-manager')
    const gr = await gm.getGiverList({ page: 1, pageSize: 500 })
    const unpacked = unwrapCloudObjectData(gr)
    const raw = Array.isArray(unpacked) ? unpacked : Array.isArray(gr?.data) ? gr.data : []
    giverRows.value = raw.filter((x) => x && !x.is_deleted)
  } catch {
    giverRows.value = []
  }
}

async function load() {
  if (!id.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    await loadGivers()
    const tm = uniCloud.importObject('taker-manager')
    const res = await tm.getTakerDetail({ id: id.value })
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
  if (skipNextShowDetailFetch.value) {
    skipNextShowDetailFetch.value = false
    return
  }
  if (id.value) await load()
})

function goEdit() {
  if (!id.value) return
  uni.navigateTo({ url: `/pages/taker/edit?id=${id.value}` })
}

function goMatch() {
  if (!id.value) return
  uni.navigateTo({ url: `/pages/matching/index?takerId=${id.value}` })
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
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
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
  border-radius: 0;
}

.row__l {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  flex-shrink: 0;
  margin-right: 24rpx;
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

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx $page-padding-x;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid $color-border;
}

.cta {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #4a90e2;
  color: #fff;
  font-size: $font-size-base;

  &::after {
    border: none;
  }
}
</style>
