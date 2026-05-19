<template>
  <CareLevelPickerPopup
    :shown="visible"
    :options="options"
    :initial-index="initialIndex"
    @close="emit('close')"
    @confirm="(i) => emit('confirm', i)"
  />
</template>

<script setup>
import CareLevelPickerPopup from '@/components/common/CareLevelPickerPopup.vue'

defineProps({
  visible: { type: Boolean, default: false },
  options: {
    type: Array,
    default: () => []
  },
  initialIndex: { type: Number, default: 0 }
})

const emit = defineEmits(['close', 'confirm'])
</script>
