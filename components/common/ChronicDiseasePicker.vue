<template>
  <ChronicDiseasePickerPopup
    :shown="visible"
    :options="options"
    :initial-value="initialValue"
    @close="emit('close')"
    @confirm="(v) => emit('confirm', v)"
  />
</template>

<script setup>
import ChronicDiseasePickerPopup from '@/components/common/ChronicDiseasePickerPopup.vue'

defineProps({
  visible: { type: Boolean, default: false },
  options: {
    type: Array,
    default: () => []
  },
  initialValue: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])
</script>
