<template>
  <view class="page">
    <u-navbar
      title="选择护理员"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      :auto-back="true"
      left-icon="arrow-left"
      right-icon="search"
      @click-right="goSearch"
    />

    <scroll-view v-if="!empty" scroll-y class="list">
      <view
        v-for="item in displayList"
        :key="item._id"
        class="cell"
        @tap="pick(item)"
      >
        <view class="ava" />
        <text class="name">{{ item.name }}</text>
        <view class="chk" :class="{ 'chk--on': selectedId === item._id }" />
      </view>
    </scroll-view>

    <view v-else class="empty">
      <view class="empty__pic" />
      <text class="empty__hint">空的，去新建</text>
      <button class="empty__btn" @tap="goForm">新建护工档案</button>
    </view>

    <view v-if="!empty" class="foot">
      <button class="foot__btn" @tap="goForm">新建档案</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useMatchingStore } from '@/store/matching'
import { unwrapCloudObjectData } from '@/utils/cloud-result.js'

const list = ref([])
const loading = ref(true)
const selectedId = ref('')

const matchingStore = useMatchingStore()

const empty = computed(() => !loading.value && (!list.value || list.value.length === 0))

const displayList = computed(() => list.value)

function filterRows(rows) {
  return (rows || []).filter(
    (r) =>
      r &&
      !r.is_deleted &&
      (r.status === 'active' || r.status === undefined || r.status === '')
  )
}

async function fetchList() {
  loading.value = true
  try {
    const gm = uniCloud.importObject('giver-manager')
    const res = await gm.getGiverList({ page: 1, pageSize: 500 })
    const raw = unwrapCloudObjectData(res) ?? res?.data ?? []
    const arr = Array.isArray(raw) ? raw : []
    list.value = filterRows(arr)
    const sid = matchingStore.selectedGiver?._id
    if (sid) selectedId.value = sid
  } finally {
    loading.value = false
  }
}

onLoad(() => {
  fetchList()
})

function pick(item) {
  selectedId.value = item._id
  matchingStore.setSelectedGiver(item)
  uni.navigateBack()
}

function goForm() {
  uni.navigateTo({ url: '/pages/giver/form' })
}

function goSearch() {
  uni.navigateTo({ url: '/pages/matching/search?type=giver' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 180rpx;
  box-sizing: border-box;
}

.list {
  height: calc(100vh - 200rpx);
  padding: 24rpx 32rpx 0;
  box-sizing: border-box;
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
  flex-shrink: 0;
}

.name {
  flex: 1;
  font-size: 34rpx;
  font-weight: 700;
  color: #1a1a2e;
}

.chk {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  border: 2rpx solid #d9dfe8;
  box-sizing: border-box;
}

.chk--on {
  background: #4a90e2;
  border-color: #4a90e2;
}

.empty {
  padding-top: 200rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty__pic {
  width: 108rpx;
  height: 108rpx;
  border-radius: 16rpx;
  background: #e8ecf2;
  margin-bottom: 32rpx;
}

.empty__hint {
  font-size: 28rpx;
  color: $color-text-secondary;
  margin-bottom: 40rpx;
}

.empty__btn {
  width: 400rpx;
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: $color-primary;
  color: #fff;
  border: none;
  font-size: 30rpx;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 72rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #f5f7fa;
}

.foot__btn {
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  border-radius: 46rpx;
  border: none;
  background: $color-primary;
  color: #fff;
  font-size: 30rpx;
  font-weight: 600;
}
</style>
