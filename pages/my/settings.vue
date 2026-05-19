<template>
  <view class="page">
    <view class="card">
      <view class="card__row" @tap="goUploadRules">
        <view class="card__ico" aria-hidden="true" />
        <text class="card__txt">规则管理</text>
        <u-icon name="arrow-right" color="#BFBFBF" size="34" />
      </view>
    </view>
  </view>
</template>

<script setup>
function goUploadRules() {
  uni.navigateTo({ url: '/pages/admin/upload-rules' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  box-sizing: border-box;
  background: #f5f7fa;
  padding: 24rpx 32rpx;
}

.card {
  background: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: $shadow-sm;
}

.card__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 100rpx;
  padding: 0 28rpx 0 32rpx;
  box-sizing: border-box;
}

.card__ico {
  width: 26rpx;
  height: 26rpx;
  border-radius: 6rpx;
  background: #e8ecf2;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.card__txt {
  flex: 1;
  font-size: 34rpx;
  color: #1a1a2e;
}
</style>
