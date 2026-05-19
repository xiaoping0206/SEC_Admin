<template>
  <view class="page">
    <MatchingHomeCanvas />

    <!-- 遮罩 Figma 3588:7956 -->
    <MatchingOverlayMask mode="single" @close="goBack" />

    <!-- 底部弹层 Figma 3588:6779 -->
    <MatchingSetupSheet mode="single" />
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import MatchingHomeCanvas from '@/components/matching/MatchingHomeCanvas.vue'
import MatchingOverlayMask from '@/components/matching/MatchingOverlayMask.vue'
import MatchingSetupSheet from '@/components/matching/MatchingSetupSheet.vue'
import { useMatchingStore } from '@/store/matching'

const matchingStore = useMatchingStore()

function goBack() {
  uni.navigateBack()
}

onLoad(() => {
  matchingStore.setMatchMode('single')
})
</script>

<style lang="scss" scoped>
$page-purple-light: #fbf8ff;
$page-purple-deep: #eadaff;

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, $page-purple-light 0%, $page-purple-deep 100%);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
</style>
