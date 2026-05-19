<template>
  <UserCard
    :name="giver.name"
    :subtitle="`${giver.experience_years}年经验 · ${giver.wuxing} · ${capacityLabel}`"
    @tap="$emit('tap')"
  >
    <template #right>
      <view class="capacity-badge">
        <text class="capacity-text">{{ giver.current_taker_count }}/{{ giver.max_taker_count }}</text>
      </view>
    </template>
  </UserCard>
</template>

<script setup>
import { computed } from 'vue'
import UserCard from '@/components/common/UserCard.vue'

const props = defineProps({
  giver: { type: Object, required: true }
})

defineEmits(['tap'])

const capacityLabel = computed(() =>
  props.giver.current_taker_count >= props.giver.max_taker_count ? '已满' : '可接'
)
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.capacity-badge {
  background: $color-bg;
  border: 2rpx solid $color-border;
  border-radius: $radius-sm;
  padding: $spacing-xs $spacing-sm;

  .capacity-text { font-size: $font-size-xs; color: $color-text-secondary; }
}
</style>
