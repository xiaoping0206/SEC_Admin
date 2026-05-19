<template>
  <view class="page">
    <u-navbar
      title="新建档案"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      :auto-back="true"
      left-icon="arrow-left"
      bg-color="#ffffff"
    />
    <view class="main">
      <button class="btn btn--solid" plain="false" @tap="goTaker">新建老人档案</button>
      <button class="btn btn--outline" plain="false" @tap="goGiver">新建护工档案</button>
    </view>
  </view>
</template>

<script setup>
function goTaker() {
  uni.navigateTo({ url: '/pages/taker/form' })
}

function goGiver() {
  uni.navigateTo({ url: '/pages/giver/form' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl $page-padding-x;
  gap: $spacing-xl;
  min-height: 60vh;
}

.btn {
  width: 396rpx;
  height: 96rpx;
  line-height: 96rpx;
  margin: 0;
  border-radius: 12rpx;
  font-size: $font-size-base;

  &::after {
    border: none;
  }
}

.btn--solid {
  background: #4a90e2;
  color: #ffffff;
}

.btn--outline {
  background: transparent;
  color: #4a90e2;
  border-width: 2rpx !important;
  border-style: solid !important;
  border-color: #4a90e2 !important;
}

</style>
