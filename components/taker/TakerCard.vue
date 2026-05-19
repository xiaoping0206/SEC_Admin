<template>
  <UserCard
    :name="taker.name"
    :subtitle="`${taker.age}岁 · ${careLabel} · ${taker.wuxing}`"
    @tap="$emit('tap')"
  >
    <template #right>
      <view class="status-dot" :class="{ matched: taker.is_matched }" />
    </template>
  </UserCard>
</template>

<script setup>
import { computed } from 'vue'
import UserCard from '@/components/common/UserCard.vue'

const props = defineProps({
  taker: { type: Object, required: true }
})

defineEmits(['tap'])

const careLabel = computed(() => `${props.taker.care_level}级护理`)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.status-dot {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background: $color-border;

  &.matched { background: $color-success; }
}
</style>
