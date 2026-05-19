<template>
  <view class="page">
    <text class="header">{{ headerLine }}</text>

    <view v-if="!list.length" class="state">
      <text class="muted">暂无匹配数据，请返回重试</text>
    </view>

    <view v-else class="swiper-wrap">
      <text class="hint">左右滑动查看各护工，点击卡片可选择</text>
      <swiper
        class="swiper"
        :style="{ height: swiperH + 'px' }"
        :current="swiperCurrent"
        :indicator-dots="list.length > 1"
        indicator-color="rgba(0,0,0,0.15)"
        :indicator-active-color="activeColor"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(r, idx) in list" :key="cardKey(r, idx)" class="si">
          <view
            class="card"
            :class="{ 'card--sel': selectedIndex === idx }"
            @tap="tapCard(idx)"
          >
            <view class="row-top">
              <text class="gname">{{ r.giver_name }}</text>
              <MatchTag :grade="r.match_grade" size="normal" />
              <text class="score">{{ r.total_score }}分</text>
            </view>
            <CareScoreBar :scores="r.scores" show-labels />
            <view v-if="selectedIndex === idx" class="sel-badge">
              <text class="sel-badge__txt">已选择</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <text class="pager">{{ swiperCurrent + 1 }} / {{ list.length }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useMatchingStore } from '@/store/matching'
import CareScoreBar from '@/components/common/CareScoreBar.vue'
import MatchTag from '@/components/common/MatchTag.vue'

const matchingStore = useMatchingStore()
const { results, currentTaker, selectedGiver, matchMode } = storeToRefs(matchingStore)

const modeFromQuery = ref('multi')
const swiperCurrent = ref(0)
const selectedIndex = ref(0)
const swiperH = ref(620)

const activeColor = '#4A90D9'

function cardKey(r, idx) {
  return String(r?.giver_id ?? idx)
}

function layoutSwiperHeight() {
  try {
    const s = uni.getSystemInfoSync()
    const usable = Math.max(420, Math.min((s.windowHeight || 667) - 220, 900))
    swiperH.value = usable
  } catch {
    swiperH.value = 620
  }
}

const list = computed(() => {
  const raw = Array.isArray(results.value) ? results.value : []
  const isSingle = modeFromQuery.value === 'single' || matchMode.value === 'single'
  const gid = selectedGiver.value?._id
  if (isSingle && gid) {
    return raw.filter((r) => String(r?.giver_id) === String(gid))
  }
  return raw
})

const headerLine = computed(() => {
  const m = modeFromQuery.value === 'single' ? '单人' : '多人'
  const tn = String(currentTaker.value?.name || '').trim()
  const gn = String(selectedGiver.value?.name || '').trim()
  if (modeFromQuery.value === 'single' && gn) {
    return `匹配结果 · ${tn || '老人'} × ${gn}`
  }
  return tn ? `匹配结果 · ${tn}` : '匹配结果'
})

function onSwiperChange(e) {
  const cur = typeof e.detail.current === 'number' ? e.detail.current : 0
  swiperCurrent.value = cur
  selectedIndex.value = cur
}

function tapCard(idx) {
  swiperCurrent.value = idx
  selectedIndex.value = idx
}

onLoad((opts) => {
  layoutSwiperHeight()
  if (opts?.mode === 'single') modeFromQuery.value = 'single'
  else if (opts?.mode === 'multi') modeFromQuery.value = 'multi'
  swiperCurrent.value = 0
  selectedIndex.value = 0
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  padding: $page-padding-y $page-padding-x;
  padding-bottom: calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.header {
  display: block;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
}

.hint {
  display: block;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  margin-bottom: 20rpx;
}

.swiper-wrap {
  width: 100%;
}

.swiper {
  width: 100%;
}

.si {
  display: flex;
  align-items: stretch;
  justify-content: center;
  box-sizing: border-box;
  padding: 8rpx 0 48rpx;
}

.card {
  width: calc(100% - 48rpx);
  max-width: 670rpx;
  margin: 0 auto;
  background: $color-surface;
  border-radius: $radius-lg;
  padding: $spacing-lg;
  box-sizing: border-box;
  border: 3rpx solid transparent;
  box-shadow: $shadow-sm;
}

.card--sel {
  border-color: rgba(74, 144, 226, 0.65);
  box-shadow:
    $shadow-md,
    0 0 0 4rpx rgba(74, 144, 226, 0.12);
}

.row-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
  gap: $spacing-md;
  margin-bottom: $spacing-md;
}

.gname {
  flex: 1;
  min-width: 40%;
  font-size: $font-size-lg;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
}

.score {
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $color-primary;
}

.sel-badge {
  margin-top: $spacing-md;
}
.sel-badge__txt {
  font-size: $font-size-sm;
  color: $color-primary;
  font-weight: $font-weight-medium;
}

.pager {
  display: block;
  text-align: center;
  font-size: $font-size-xs;
  color: $color-text-disabled;
  margin-top: 8rpx;
}

.state {
  padding: 120rpx 24rpx;
  text-align: center;
}

.muted {
  font-size: $font-size-base;
  color: $color-text-secondary;
}
</style>
