<template>
  <view class="page">
    <MatchingSelectNav
      title="选择护工"
      @back="goBack"
      @search="goSearch"
    />

    <view v-if="loading" class="loading">
      <text class="loading__tx ff-yuan">加载中…</text>
    </view>

    <!-- Figma 3588:7765 选择护工-空 -->
    <MatchingSelectEmpty
      v-else-if="empty"
      create-label="新建护工"
      :pad-top-px="emptyPadPx"
      @create="goForm"
    />

    <!-- Figma 3588:7883 选择护工_有 -->
    <template v-else>
      <scroll-view
        scroll-y
        class="list"
        :style="{ paddingTop: listPadPx + 'px', height: scrollHPx + 'px' }"
        :show-scrollbar="false"
      >
        <view
          v-for="item in displayList"
          :key="item._id"
          class="row"
          @tap="pick(item)"
        >
          <view class="row__ava" :style="{ background: avatarColor(item.name, 1) }">
            <text class="row__ava-tx ff-yuan">{{ avatarInitial(item.name) }}</text>
          </view>
          <text class="row__name ff-yuan">{{ item.name }}</text>
          <image
            class="row__load row__load--giver"
            :src="GIVER_LOAD_ICON[getGiverLoadKey(item)]"
            mode="aspectFit"
          />
        </view>
      </scroll-view>

      <view class="foot">
        <view class="foot__fade" />
        <view class="foot__btn" @tap="goForm">
          <text class="foot__btn-tx ff-yuan">新建护工</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import MatchingSelectNav from '@/components/matching/MatchingSelectNav.vue'
import MatchingSelectEmpty from '@/components/matching/MatchingSelectEmpty.vue'
import { useMatchingStore } from '@/store/matching'
import {
  avatarColor,
  fetchActiveGivers,
  getGiverLoadKey,
  GIVER_LOAD_ICON
} from '@/utils/matching-select.js'

const list = ref([])
const loading = ref(true)
const listPadPx = ref(110)
const scrollHPx = ref(600)
const emptyPadPx = ref(187)

const matchingStore = useMatchingStore()

const empty = computed(() => !loading.value && !list.value.length)
const displayList = computed(() => list.value)

function avatarInitial(name) {
  const s = String(name || '').trim()
  return s ? s.slice(0, 1) : '护'
}

function layout() {
  const s = uni.getSystemInfoSync()
  listPadPx.value = uni.upx2px(220)
  scrollHPx.value = Math.max(300, s.windowHeight)
  emptyPadPx.value = uni.upx2px(374)
}

async function fetchList() {
  loading.value = true
  try {
    list.value = await fetchActiveGivers()
  } finally {
    loading.value = false
  }
}

onMounted(layout)

onLoad((opts) => {
  matchingStore.setMatchMode('single')
  if (opts?.state === 'empty') {
    list.value = []
    loading.value = false
    return
  }
  fetchList()
})

function pick(item) {
  matchingStore.setSelectedGiver(item)
  uni.navigateBack()
}

function goBack() {
  uni.navigateBack()
}

function goForm() {
  const mode = matchingStore.matchMode === 'single' ? 'single' : 'multi'
  uni.navigateTo({
    url: `/pages/giver/form?from=matching&mode=${mode}`
  })
}

function goSearch() {
  uni.navigateTo({ url: '/pages/matching/search?type=giver' })
}
</script>

<style lang="scss" scoped>
$page-light: #faf6ff;
$page-deep: #eadaff;
$match-purple: #9245f9;
$match-purple-light: #c766ff;

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, $page-light 0%, $page-deep 100%);
  box-sizing: border-box;
}

.loading {
  padding-top: 400rpx;
  display: flex;
  justify-content: center;
}

.loading__tx {
  font-size: 28rpx;
  color: #6c5c76;
}

.list {
  box-sizing: border-box;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 240rpx;
}

.row {
  height: 120rpx;
  border-radius: 24rpx;
  background: #ffffff;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 36rpx;
  box-sizing: border-box;
}

.row__ava {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.row__ava-tx {
  font-size: 24rpx;
  font-weight: 600;
  color: #ffffff;
}

.row__name {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #31233a;
  line-height: normal;
}

.row__load--giver {
  width: 86rpx;
  height: 42rpx;
  flex-shrink: 0;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  pointer-events: none;
}

.foot__fade {
  height: 232rpx;
  background: linear-gradient(
    180deg,
    rgba(240, 232, 251, 0) 0%,
    #f0e8fb 23.45%,
    #f0e8fb 100%
  );
}

.foot__btn {
  position: absolute;
  left: 60rpx;
  right: 60rpx;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  height: 96rpx;
  border-radius: 100rpx;
  background: linear-gradient(47.18deg, $match-purple-light 11.9%, $match-purple 94.02%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.foot__btn-tx {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: normal;
}
</style>
