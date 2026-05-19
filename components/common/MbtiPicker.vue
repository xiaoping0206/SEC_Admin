<template>
  <MbtiPickerPopup
    :shown="visible"
    :initial-value="value"
    @close="emit('close')"
    @confirm="(s) => emit('confirm', s)"
  />
</template>

<script setup>
import MbtiPickerPopup from '@/components/common/MbtiPickerPopup.vue'

defineProps({
  visible: { type: Boolean, default: false },
  value: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])
</script>
