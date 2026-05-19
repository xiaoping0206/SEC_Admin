<template>
  <view class="page">
    <u-navbar
      title=""
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      :auto-back="true"
      left-icon="arrow-left"
    />

    <view class="top">
      <view class="search-row">
        <input
          class="search-inp"
          type="text"
          :focus="autoFocus"
          placeholder="搜索姓名"
          confirm-type="search"
          :value="rawKw"
          @input="onInput"
        />
        <text class="cancel" @tap="cancel">取消</text>
      </view>
    </view>

    <scroll-view scroll-y class="body">
      <view v-if="showHist" class="hist">
        <view class="hist__hd">
          <text class="hist__ttl">历史搜索</text>
          <text class="hist__del" @tap="clearHist">清空</text>
        </view>
        <view v-if="history.length" class="chips">
          <text
            v-for="(h, i) in history"
            :key="'h-' + i"
            class="chip"
            @tap="tapHist(h)"
          >{{ h }}</text>
        </view>
        <text v-else class="hist__empty">暂无历史</text>
      </view>

      <view v-else class="res">
        <view class="tabs">
          <text class="tabs__one">全部</text>
        </view>
        <view
          v-for="row in merged"
          :key="row.key"
          class="cell"
          @tap="pick(row)"
        >
          <view class="ava" />
          <text class="name">{{ row.item.name }}</text>
          <text class="tag" :class="row.type === 'taker' ? 'tag--tk' : 'tag--gv'">
            {{ row.type === 'taker' ? '老人' : '护工' }}
          </text>
        </view>
        <text v-if="merged.length === 0" class="nore">暂无结果</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMatchingStore } from '@/store/matching'
import { unwrapCloudObjectData } from '@/utils/cloud-result.js'

const STORAGE_KEY = 'search_history'

const rawKw = ref('')
const debouncedKw = ref('')
const autoFocus = ref(true)
const takerRows = ref([])
const giverRows = ref([])
const history = ref([])
const searchType = ref('both')
let debTimer = null

const matchingStore = useMatchingStore()

const showHist = computed(() => !String(rawKw.value).trim())

const merged = computed(() => {
  const k = debouncedKw.value.trim().toLowerCase()
  if (!k) return []
  const out = []
  const takeT = searchType.value === 'taker' || searchType.value === 'both'
  const takeG = searchType.value === 'giver' || searchType.value === 'both'
  if (takeT) {
    takerRows.value.forEach((item) => {
      const n = String(item.name || '').toLowerCase()
      if (n.includes(k)) out.push({ type: 'taker', item, key: 't-' + item._id })
    })
  }
  if (takeG) {
    giverRows.value.forEach((item) => {
      const n = String(item.name || '').toLowerCase()
      if (n.includes(k)) out.push({ type: 'giver', item, key: 'g-' + item._id })
    })
  }
  return out
})

function scheduleDebounced() {
  clearTimeout(debTimer)
  debTimer = setTimeout(() => {
    debouncedKw.value = rawKw.value
  }, 300)
}

function loadHistory() {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    history.value = Array.isArray(raw) ? raw : []
  } catch {
    history.value = []
  }
}

function saveHistory(text) {
  const t = String(text || '').trim()
  if (!t) return
  let arr = [...history.value].filter((x) => x !== t)
  arr.unshift(t)
  arr = arr.slice(0, 10)
  history.value = arr
  try {
    uni.setStorageSync(STORAGE_KEY, arr)
  } catch {
    /* ignore */
  }
}

function clearHist() {
  history.value = []
  try {
    uni.removeStorageSync(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

async function loadLists() {
  const tm = uniCloud.importObject('taker-manager')
  const gm = uniCloud.importObject('giver-manager')
  const [tr, gr] = await Promise.all([
    tm.getTakerList({ page: 1, pageSize: 500 }),
    gm.getGiverList({ page: 1, pageSize: 500 })
  ])
  const ta = unwrapCloudObjectData(tr) ?? tr?.data ?? []
  const gi = unwrapCloudObjectData(gr) ?? gr?.data ?? []
  takerRows.value = (Array.isArray(ta) ? ta : []).filter(
    (r) => r && !r.is_deleted && (r.status === 'active' || r.status === undefined)
  )
  giverRows.value = (Array.isArray(gi) ? gi : []).filter(
    (r) => r && !r.is_deleted && (r.status === 'active' || r.status === undefined)
  )
}

onLoad((opts) => {
  const t = opts?.type
  if (t === 'giver') searchType.value = 'giver'
  else if (t === 'taker') searchType.value = 'taker'
  else searchType.value = 'both'
  loadHistory()
  loadLists()
  debouncedKw.value = ''
})

onUnmounted(() => {
  clearTimeout(debTimer)
})

function onInput(e) {
  rawKw.value = e.detail.value || ''
  scheduleDebounced()
}

function tapHist(h) {
  rawKw.value = h
  scheduleDebounced()
}

function cancel() {
  uni.navigateBack()
}

function pick(row) {
  saveHistory(debouncedKw.value.trim())
  if (row.type === 'taker') {
    matchingStore.setSelectedTaker(row.item)
  } else {
    matchingStore.setSelectedGiver(row.item)
  }
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: #f5f7fa;
}

.top {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  padding: 16rpx 24rpx 20rpx;
}

.search-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.search-inp {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  border-radius: 36rpx;
  background: #f2f3f5;
  font-size: 28rpx;
  box-sizing: border-box;
}

.cancel {
  font-size: 28rpx;
  color: #4a90e2;
  flex-shrink: 0;
}

.body {
  height: calc(100vh - 200rpx);
  padding: 24rpx;
  box-sizing: border-box;
}

.hist__hd {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.hist__ttl {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a2e;
}

.hist__del {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.hist__empty {
  font-size: 26rpx;
  color: $color-text-secondary;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.chip {
  font-size: 24rpx;
  padding: 12rpx 24rpx;
  border-radius: 999rpx;
  background: #e8ecf2;
  color: #1a1a2e;
}

.tabs {
  margin-bottom: 20rpx;
}

.tabs__one {
  font-size: 28rpx;
  font-weight: 600;
  color: $color-primary;
  padding-bottom: 8rpx;
  border-bottom: 4rpx solid $color-primary;
}

.cell {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100rpx;
  padding: 0 20rpx;
  margin-bottom: 16rpx;
  background: #ffffff;
  border-radius: 16rpx;
}

.ava {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #d9dfe8;
  margin-right: 20rpx;
}

.name {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a2e;
}

.tag {
  font-size: 22rpx;
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
}

.tag--tk {
  background: rgba(74, 144, 226, 0.12);
  color: $color-primary;
}

.tag--gv {
  background: rgba(82, 196, 160, 0.15);
  color: #349c7e;
}

.nore {
  display: block;
  text-align: center;
  color: $color-text-secondary;
  font-size: 26rpx;
  padding-top: 80rpx;
}
</style>
