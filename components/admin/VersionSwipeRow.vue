<template>
  <view class="swipe">
    <view
      v-if="!disabled"
      class="swipe__actions"
      :style="{ width: actionWidthPx + 'px' }"
    >
      <view class="swipe__del" @tap.stop="emit('delete')">
        <text class="swipe__del-txt ff-yuan">删除</text>
      </view>
    </view>

    <view
      class="swipe__panel"
      :style="panelStyle"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchEnd"
    >
      <slot />
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  actionWidthPx: { type: Number, default: 70 },
  opened: { type: Boolean, default: false },
  resetSignal: { type: Number, default: 0 }
})

const emit = defineEmits(['delete', 'open', 'close', 'interact'])

const startX = ref(0)
const startY = ref(0)
const offsetX = ref(0)
const moving = ref(false)
const dragging = ref(false)

watch(
  () => props.opened,
  (val) => {
    if (moving.value) return
    offsetX.value = val ? -props.actionWidthPx : 0
  },
  { immediate: true }
)

watch(
  () => props.resetSignal,
  () => {
    if (moving.value || props.opened) return
    offsetX.value = 0
  }
)

const panelStyle = computed(() => ({
  transform: `translateX(${offsetX.value}px)`,
  transition: moving.value ? 'none' : 'transform 0.24s ease'
}))

function onTouchStart(e) {
  if (props.disabled) return
  const touch = e.touches?.[0]
  if (!touch) return
  emit('interact')
  startX.value = touch.clientX
  startY.value = touch.clientY
  dragging.value = false
  moving.value = true
}

function onTouchMove(e) {
  if (props.disabled || !moving.value) return
  const touch = e.touches?.[0]
  if (!touch) return

  const dx = touch.clientX - startX.value
  const dy = touch.clientY - startY.value

  if (!dragging.value) {
    if (Math.abs(dx) <= Math.abs(dy)) return
    dragging.value = true
  }

  const base = props.opened ? -props.actionWidthPx : 0
  let next = base + dx
  if (next > 0) next = 0
  if (next < -props.actionWidthPx) next = -props.actionWidthPx
  offsetX.value = next
}

function onTouchEnd() {
  if (props.disabled || !moving.value) return
  moving.value = false

  if (!dragging.value) return

  const shouldOpen = offsetX.value <= -props.actionWidthPx / 2
  offsetX.value = shouldOpen ? -props.actionWidthPx : 0
  if (shouldOpen) {
    emit('open')
  } else {
    emit('close')
  }
}
</script>

<style lang="scss" scoped>
.swipe {
  position: relative;
  margin-bottom: 24rpx;
  border-radius: 32rpx;
  overflow: hidden;
}

.swipe__actions {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.swipe__del {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e32525;
  border-radius: 0 32rpx 32rpx 0;
  box-sizing: border-box;
}

.swipe__del-txt {
  font-size: 28rpx;
  font-weight: 600;
  color: #ffffff;
}

.swipe__panel {
  position: relative;
  z-index: 1;
  width: 100%;
  will-change: transform;
}
</style>
