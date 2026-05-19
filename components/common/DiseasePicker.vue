<template>
  <view v-if="visible">
    <view
      style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100"
      @tap="emit('close')"
    />
    <view
      style="position:fixed;bottom:0;left:0;width:100%;background:#fff;border-radius:32rpx 32rpx 0 0;z-index:101;padding-bottom:env(safe-area-inset-bottom)"
      @tap.stop
    >
      <view
        style="display:flex;justify-content:space-between;align-items:center;padding:32rpx 40rpx;border-bottom:1rpx solid #eee"
      >
        <text style="font-size:36rpx;font-weight:600">慢性病史</text>
        <text style="font-size:28rpx;color:#999" @tap="emit('close')">关闭</text>
      </view>
      <scroll-view scroll-y style="max-height:600rpx">
        <view
          v-for="item in diseaseOptions"
          :key="item"
          style="display:flex;justify-content:space-between;align-items:center;padding:32rpx 40rpx;border-bottom:1rpx solid #f5f5f5"
          @tap="toggle(item)"
        >
          <text style="font-size:32rpx">{{ item }}</text>
          <text v-if="draft.includes(item)" style="color:#4a90e2;font-size:32rpx">✓</text>
        </view>
      </scroll-view>
      <view style="padding:24rpx 40rpx">
        <view
          style="background:#4a90e2;border-radius:16rpx;height:88rpx;display:flex;align-items:center;justify-content:center"
          @tap="onConfirm"
        >
          <text style="color:#fff;font-size:32rpx;font-weight:600">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const diseaseOptions = [
  '无',
  '糖尿病',
  '心脏病',
  '高血压',
  '阿尔兹海默症',
  '关节炎',
  '慢阻肺',
  '脑卒中后遗症'
]

const props = defineProps({
  visible: { type: Boolean, default: false },
  /** string[] — 回填 */
  value: {
    type: Array,
    default: () => ['无']
  }
})

const emit = defineEmits(['close', 'confirm'])

const draft = ref(['无'])

watch(
  () => props.visible,
  (v) => {
    if (v) {
      const src = Array.isArray(props.value) && props.value.length
        ? [...props.value]
        : ['无']
      draft.value = src.length ? src : ['无']
    }
  }
)

function toggle(item) {
  if (item === '无') {
    draft.value = ['无']
    return
  }
  const next = draft.value.filter((i) => i !== '无')
  const idx = next.indexOf(item)
  if (idx === -1) next.push(item)
  else next.splice(idx, 1)
  draft.value = next.length ? next : ['无']
}

function onConfirm() {
  const out = [...draft.value]
  emit('confirm', out)
  emit('close')
}
</script>
