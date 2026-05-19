<template>
  <view class="page">
    <text class="muted">消息中心（占位页）</text>
    <AppCustomTabBar active="message" />
  </view>
</template>

<script setup>
import AppCustomTabBar from '@/components/common/AppCustomTabBar.vue'
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  padding: $spacing-xl $page-padding-x;
  padding-bottom: calc(#{$spacing-xl} + 126rpx + env(safe-area-inset-bottom));
  background: #F7F8FA;
  box-sizing: border-box;
}

.muted {
  font-size: $font-size-base;
  color: $color-text-secondary;
}
</style>
