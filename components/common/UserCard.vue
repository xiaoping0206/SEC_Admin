<template>
  <view class="user-card" @tap="$emit('tap')">
    <view class="avatar-wrap">
      <text class="avatar-text">{{ nameInitial }}</text>
    </view>
    <view class="info">
      <text class="name">{{ name }}</text>
      <text class="sub">{{ subtitle }}</text>
    </view>
    <view class="right">
      <slot name="right" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  subtitle: { type: String, default: '' }
})

defineEmits(['tap'])

const nameInitial = computed(() => props.name?.charAt(0) ?? '?')
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.user-card {
  display: flex;
  align-items: center;
  background: $color-surface;
  border-radius: $radius-lg;
  padding: $spacing-md;
  box-shadow: $shadow-sm;
  margin-bottom: $spacing-md;
  gap: $spacing-md;
}

.avatar-wrap {
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: $color-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  .avatar-text {
    color: #fff;
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
  }
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-xs;

  .name { font-size: $font-size-base; font-weight: $font-weight-medium; color: $color-text-primary; }
  .sub  { font-size: $font-size-sm; color: $color-text-secondary; }
}

.right { flex-shrink: 0; }
</style>
