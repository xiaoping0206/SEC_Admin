<template>
  <view
    class="mask"
    :class="isSingle ? 'mask--single' : 'mask--multi'"
    @tap="emit('close')"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /** multi → Figma 3588:7917；single → Figma 3588:7956 */
  mode: {
    type: String,
    default: 'multi'
  }
})

const emit = defineEmits(['close'])

const isSingle = computed(() => props.mode === 'single')
</script>

<style lang="scss" scoped>
/* 遮罩 Figma 3588:7917（多人）/ 3588:7956（单人） */
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(2rpx);
  -webkit-backdrop-filter: blur(2rpx);
}
</style>
