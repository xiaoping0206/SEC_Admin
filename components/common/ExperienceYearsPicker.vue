<template>
  <ExperienceYearsPickerPopup
    :shown="visible"
    :options="options"
    :initial-index="initialIndex"
    @close="emit('close')"
    @confirm="(v) => emit('confirm', v)"
  />
</template>

<script setup>
import ExperienceYearsPickerPopup from '@/components/common/ExperienceYearsPickerPopup.vue'

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
