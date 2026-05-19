<template>
  <view class="score-bar-wrap">
    <view v-for="dim in dimensions" :key="dim.key" class="dim-row">
      <text v-if="showLabels" class="dim-label">{{ dim.label }}</text>
      <view class="bar-track">
        <view class="bar-fill" :style="{ width: `${dim.score}%`, background: dim.color }" />
      </view>
      <text class="dim-score">{{ dim.score }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scores: {
    type: Object,
    required: true
    // { wuxing_score, mbti_score, env_score, sixiang_score }
  },
  showLabels: { type: Boolean, default: false }
})

const dimensions = computed(() => [
  { key: 'wuxing', label: '五行', score: props.scores.wuxing_score ?? 0, color: '#4A90D9' },
  { key: 'mbti',   label: 'MBTI', score: props.scores.mbti_score   ?? 0, color: '#52C4A0' },
  { key: 'env',    label: '环境', score: props.scores.env_score    ?? 0, color: '#D4A96A' },
  { key: 'sixiang',label: '四象', score: props.scores.sixiang_score ?? 0, color: '#FF6B6B' }
])
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.score-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.dim-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.dim-label {
  width: 80rpx;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 12rpx;
  background: $color-border;
  border-radius: $radius-full;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: $radius-full;
  transition: width $transition-base;
}

.dim-score {
  width: 60rpx;
  text-align: right;
  font-size: $font-size-xs;
  color: $color-text-secondary;
  flex-shrink: 0;
}
</style>
