<template>
  <view class="match-tag" :class="[`grade-${grade}`, size]">
    <text class="grade-text">{{ grade }}</text>
  </view>
</template>

<script setup>
defineProps({
  grade: { type: String, required: true },  // S | A | B | C | D
  size: { type: String, default: 'normal' } // normal | large
})
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.match-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: $radius-sm;
  font-weight: $font-weight-bold;

  &.normal {
    width: 56rpx;
    height: 56rpx;
    font-size: $font-size-base;
  }

  &.large {
    width: 100rpx;
    height: 100rpx;
    font-size: $font-size-2xl;
    border-radius: $radius-md;
  }

  &.grade-S { background: $color-grade-s; color: #fff; }
  &.grade-A { background: $color-grade-a; color: #fff; }
  &.grade-B { background: $color-grade-b; color: #fff; }
  &.grade-C { background: $color-grade-c; color: #fff; }
  &.grade-D { background: $color-grade-d; color: #fff; }
}
</style>
