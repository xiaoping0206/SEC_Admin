<template>
  <view class="empty-state">
    <text class="empty-icon">📭</text>
    <text class="empty-message">{{ message }}</text>
    <slot />
  </view>
</template>

<script setup>
defineProps({
  message: { type: String, default: '暂无数据' }
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-2xl $spacing-lg;
  gap: $spacing-md;

  .empty-icon { font-size: 120rpx; }

  .empty-message {
    font-size: $font-size-base;
    color: $color-text-secondary;
    text-align: center;
  }
}
</style>
