<template>
  <view class="page">
    <text class="title">周报</text>
    <text class="muted">周报详情占位，数据来源「weekly-report」云函数。</text>
  </view>
</template>

<script setup>
//
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  padding: $spacing-xl $page-padding-x;
  background: $color-bg;
  box-sizing: border-box;
}

.title {
  display: block;
  font-size: $font-size-md;
  font-weight: $font-weight-bold;
  color: $color-text-primary;
  margin-bottom: $spacing-md;
}

.muted {
  font-size: $font-size-sm;
  color: $color-text-secondary;
  line-height: $line-height-loose;
}
</style>
