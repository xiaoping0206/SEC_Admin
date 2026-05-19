<template>
  <view class="sheet" @tap.stop>
    <view
      class="sheet__inner"
      :class="isSingle ? 'sheet__inner--single' : 'sheet__inner--multi'"
    >
      <text class="sheet__ttl">{{ isSingle ? '单人匹配' : '多人匹配' }}</text>
      <view class="sheet__line" />
      <text class="sheet__lab ff-yuan"><text class="req">*</text>选择老人</text>
      <view
        class="sheet__field"
        :class="{ 'sheet__field--1': isSingle }"
        @tap="goSelectTaker"
      >
        <text :class="['sheet__ph', 'ff-yuan', takerName ? 'sheet__ph--on' : '']">
          {{ takerName || '请选择匹配的老人' }}
        </text>
        <image
          class="sheet__chev"
          src="/static/figma/matching/ic_sheet_chevron.svg"
          mode="aspectFit"
        />
      </view>
      <template v-if="isSingle">
        <text class="sheet__lab sheet__lab--2 ff-yuan"><text class="req">*</text>选择护工</text>
        <view class="sheet__field sheet__field--2" @tap="goSelectGiver">
          <text :class="['sheet__ph', 'ff-yuan', giverName ? 'sheet__ph--on' : '']">
            {{ giverName || '请选择匹配的护工' }}
          </text>
          <image
            class="sheet__chev"
            src="/static/figma/matching/ic_sheet_chevron.svg"
            mode="aspectFit"
          />
        </view>
      </template>
      <view
        class="sheet__btn"
        :class="{ 'sheet__btn--single': isSingle }"
        @tap="submit"
      >
        <text class="sheet__btn-txt ff-yuan">开始匹配</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useMatchingStore } from '@/store/matching'
import { fetchActiveGivers, fetchActiveTakers } from '@/utils/matching-select.js'

const props = defineProps({
  /** multi → Figma 3588:6766；single → Figma 3588:6779 */
  mode: {
    type: String,
    default: 'multi'
  }
})

const matchingStore = useMatchingStore()
const { selectedTaker, selectedGiver } = storeToRefs(matchingStore)

const isSingle = computed(() => props.mode === 'single')

const takerName = computed(() =>
  selectedTaker.value?.name ? String(selectedTaker.value.name).trim() : ''
)
const giverName = computed(() =>
  selectedGiver.value?.name ? String(selectedGiver.value.name).trim() : ''
)

async function goSelectTaker() {
  const mode = isSingle.value ? 'single' : 'multi'
  matchingStore.setMatchMode(mode)
  try {
    const rows = await fetchActiveTakers()
    const empty = !rows.length
    uni.navigateTo({
      url: `/pages/matching/select-taker?mode=${mode}${empty ? '&state=empty' : ''}`
    })
  } catch {
    uni.showToast({ title: '加载老人列表失败', icon: 'none' })
  }
}

async function goSelectGiver() {
  matchingStore.setMatchMode('single')
  try {
    const rows = await fetchActiveGivers()
    const empty = !rows.length
    uni.navigateTo({
      url: `/pages/matching/select-giver${empty ? '?state=empty' : ''}`
    })
  } catch {
    uni.showToast({ title: '加载护工列表失败', icon: 'none' })
  }
}

function submit() {
  if (!selectedTaker.value?._id) {
    uni.showToast({ title: '请选择老人', icon: 'none' })
    return
  }
  if (isSingle.value && !selectedGiver.value?._id) {
    uni.showToast({ title: '请选择护理员', icon: 'none' })
    return
  }
  matchingStore.setMatchMode(isSingle.value ? 'single' : 'multi')
  uni.navigateTo({ url: '/pages/matching/loading' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

$match-purple: #9245f9;

/* 底部弹层 Figma 3588:6766 / 3588:6779 — 高 380px */
.sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.sheet__inner {
  position: relative;
  width: 750rpx;
  height: 760rpx;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  box-shadow: 0 -8rpx 40rpx rgba(146, 69, 249, 0.08);
  box-sizing: border-box;
}

.sheet__ttl {
  position: absolute;
  left: 310rpx;
  top: 40rpx;
  width: 128rpx;
  height: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  line-height: 44rpx;
  text-align: center;
  color: #31233a;
}

.sheet__line {
  position: absolute;
  left: 0;
  top: 104rpx;
  width: 750rpx;
  height: 1rpx;
  background: rgba(146, 69, 249, 0.12);
}

.sheet__lab {
  position: absolute;
  left: 44rpx;
  font-size: 30rpx;
  font-weight: 600;
  line-height: normal;
  color: #6c5c76;
}

.sheet__inner--multi .sheet__lab {
  top: 164rpx;
}

.sheet__inner--single .sheet__lab:not(.sheet__lab--2) {
  top: 164rpx;
}

.sheet__lab--2 {
  top: 336rpx;
}

.req {
  color: $match-purple;
}

.sheet__field {
  position: absolute;
  left: 44rpx;
  width: 662rpx;
  height: 84rpx;
  padding: 0 40rpx;
  background: #f6eeff;
  border-radius: 100rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.sheet__inner--multi .sheet__field {
  top: 224rpx;
}

.sheet__field--1 {
  top: 224rpx;
}

.sheet__field--2 {
  top: 396rpx;
}

.sheet__ph {
  flex: 1;
  font-size: 26rpx;
  font-weight: 600;
  line-height: normal;
  color: #e8c5ff;
}

.sheet__ph--on {
  color: #31233a;
}

.sheet__chev {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.sheet__btn {
  position: absolute;
  left: 60rpx;
  top: 572rpx;
  width: 630rpx;
  height: 92rpx;
  border-radius: 100rpx;
  background: $match-purple;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet__btn--single {
  left: 68rpx;
  width: 622rpx;
}

.sheet__btn-txt {
  font-size: 32rpx;
  font-weight: 600;
  line-height: normal;
  color: #ffffff;
  text-align: center;
}
</style>
