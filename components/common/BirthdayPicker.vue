<template>
  <BirthdayPickerPopup
    :shown="visible"
    :wizard-kind="wizardKind"
    :initial-birthday="value ?? null"
    @close="emit('close')"
    @confirm="(p) => emit('confirm', p)"
  />
</template>

<script setup>
import BirthdayPickerPopup from '@/components/common/BirthdayPickerPopup.vue'

defineProps({
  visible: { type: Boolean, default: false },
  /** 与云端 birthday 一致 */
  value: { type: Object, default: null },
  wizardKind: { type: String, default: 'taker' }
})

const emit = defineEmits(['close', 'confirm'])
</script>
