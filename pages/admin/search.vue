<template>
  <view class="page" :style="{ paddingTop: statusBarPx + 'px' }">
    <view class="toolbar">
      <input
        class="search-input"
        type="text"
        confirm-type="search"
        placeholder="搜索姓名"
        :value="inputVal"
        placeholder-class="ph"
        focus
        @input="onInput"
      />
      <text class="cancel" @tap="back">取消</text>
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHpx + 'px' }">
      <view v-if="!debounced" class="hint">
        <text class="muted">请输入姓名关键字</text>
      </view>

      <template v-else-if="!takersHit.length && !giversHit.length">
        <view class="hint">
          <text class="muted">未找到相关档案</text>
        </view>
      </template>

      <template v-else>
        <view v-if="takersHit.length" class="grp">
          <text class="grp-title">老人</text>
          <view
            v-for="item in takersHit"
            :key="'t-' + item._id"
            class="card"
            @tap="openTaker(item)"
          >
            <view class="card-avatar" />
            <view class="card-mid">
              <text class="card-name">{{ item.name }}</text>
              <text class="card-sub">{{ takerSub(item) }}</text>
            </view>
          </view>
        </view>

        <view v-if="giversHit.length" class="grp">
          <text class="grp-title">护工</text>
          <view
            v-for="item in giversHit"
            :key="'g-' + item._id"
            class="card"
            @tap="openGiver(item)"
          >
            <view class="card-avatar" />
            <view class="card-mid">
              <text class="card-name">{{ item.name }}</text>
              <text class="card-sub">{{ giverSub(item) }}</text>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadArchiveLists, saveArchiveLists } from '@/utils/archive-cache.js'
import { toastCloudError } from '@/utils/cloud-error.js'

const statusBarPx = ref(20)
const scrollHpx = ref(500)

const inputVal = ref('')
const debounced = ref('')

let debounceTimer = null

const takers = ref([])
const givers = ref([])

function onInput(e) {
  const v = typeof e.detail.value === 'string' ? e.detail.value : `${e.detail.value ?? ''}`
  inputVal.value = v
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debounced.value = String(inputVal.value || '').trim()
  }, 500)
}

const takersHit = computed(() => {
  const k = debounced.value.toLowerCase()
  if (!k) return []
  return takers.value.filter(
    (t) => t.name && String(t.name).toLowerCase().includes(k)
  )
})

const giversHit = computed(() => {
  const k = debounced.value.toLowerCase()
  if (!k) return []
  return givers.value.filter(
    (g) => g.name && String(g.name).toLowerCase().includes(k)
  )
})

function layout() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  const toolbarH = uni.upx2px(100)
  scrollHpx.value = Math.max(200, s.windowHeight - statusBarPx.value - toolbarH)
}

async function hydrate() {
  const cached = loadArchiveLists()
  if (cached && Array.isArray(cached.takers) && Array.isArray(cached.givers)) {
    takers.value = cached.takers
    givers.value = cached.givers
    return
  }

  uni.showLoading({ title: '加载中', mask: true })
  try {
    const tm = uniCloud.importObject('taker-manager')
    const gm = uniCloud.importObject('giver-manager')
    const [tr, gr] = await Promise.all([
      tm.getTakerList({ page: 1, pageSize: 50 }),
      gm.getGiverList({ page: 1, pageSize: 50 })
    ])
    const rawT =
      Array.isArray(tr?.data?.list)
        ? tr.data.list
        : Array.isArray(tr?.data)
          ? tr.data
          : []
    const rawG =
      Array.isArray(gr?.data?.list)
        ? gr.data.list
        : Array.isArray(gr?.data)
          ? gr.data
          : []

    takers.value = rawT
    givers.value = rawG
    saveArchiveLists(rawT, rawG)
  } catch (e) {
    toastCloudError(e)
    takers.value = []
    givers.value = []
  } finally {
    uni.hideLoading()
  }
}

onMounted(async () => {
  layout()
  await hydrate()
})

function back() {
  uni.navigateBack({ delta: 1 })
}

function openTaker(item) {
  uni.navigateTo({ url: `/pages/taker/detail?id=${item._id}` })
}

function openGiver(item) {
  uni.navigateTo({ url: `/pages/giver/detail?id=${item._id}` })
}

function giverSub(item) {
  const qs = item.qualification || '—'
  return `${item.gender === 'female' ? '女' : '男'} · ${item.age ?? '—'}岁 · ${qs}`
}

function takerSub(item) {
  const st = item.is_matched ? '已匹配' : '待匹配'
  return `${item.gender === 'female' ? '女' : '男'} · ${item.age ?? '—'}岁 · ${st}`
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 24rpx 12rpx;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background: #ffffff;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.ph {
  color: #bbbbbb;
}

.cancel {
  font-size: 28rpx;
  color: #4a90e2;
}

.scroll {
  width: 100%;
}

.grp-title {
  display: block;
  font-size: 26rpx;
  color: $color-text-secondary;
  padding: 12rpx 24rpx 8rpx;
}

.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16rpx 24rpx;
  margin-bottom: 12rpx;
  background: #ffffff;
  border-radius: 16rpx;
  margin-left: 24rpx;
  margin-right: 24rpx;
  min-height: 176rpx;
  box-sizing: border-box;
}

.card-avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  background: #e8e8e8;
}

.card-mid {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.card-sub {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: #666666;
}

.grp:last-child .card:last-child {
  margin-bottom: 32rpx;
}

.hint {
  padding: 80rpx 24rpx;
  text-align: center;
}

.muted {
  font-size: 28rpx;
  color: $color-text-secondary;
}
</style>
