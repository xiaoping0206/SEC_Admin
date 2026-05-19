<template>
  <view v-if="shown" class="mask" @tap="emit('close')">
    <view class="sheet" @tap.stop>
      <text class="sheet__title ff-yuan">慢性病</text>
      <view class="sheet__divider" />

      <view class="sheet__picker-wrap">
        <view class="sheet__shade sheet__shade--top" />
        <view class="sheet__shade sheet__shade--bottom" />
        <view class="sheet__indicator" />
        <picker-view
          class="sheet__pv"
          :value="[pickIdx]"
          indicator-style="height: 120rpx"
          @change="onPick"
        >
          <picker-view-column>
            <view v-for="(item, i) in options" :key="'dis-' + i" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ item }}</text>
            </view>
          </picker-view-column>
        </picker-view>
      </view>

      <view class="sheet__btn" @tap="onConfirm">
        <text class="sheet__btn-tx ff-yuan">确定</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  shown: { type: Boolean, default: false },
  options: {
    type: Array,
    default: () => []
  },
  initialValue: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])

const pickIdx = ref(0)

function syncIndex() {
  const list = props.options || []
  if (!list.length) {
    pickIdx.value = 0
    return
  }
  const val = String(props.initialValue || '').trim()
  const idx = list.indexOf(val)
  pickIdx.value = idx >= 0 ? idx : 0
}

watch(
  () => props.shown,
  (v) => {
    if (v) syncIndex()
  }
)

watch([() => props.initialValue, () => props.options], () => {
  if (props.shown) syncIndex()
})

function onPick(e) {
  pickIdx.value = e.detail.value[0] || 0
}

function onConfirm() {
  const list = props.options || []
  const item = list[pickIdx.value]
  if (!item) {
    uni.showToast({ title: '请选择慢性病', icon: 'none' })
    return
  }
  emit('confirm', item)
}
</script>

<style lang="scss" scoped>
$match-purple: #9245f9;
$match-purple-light: #c766ff;

/* Figma 3588:8417 设置病史 */
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
}

.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 760rpx;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  box-sizing: border-box;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.sheet__title {
  display: block;
  padding-top: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #31233a;
  text-align: center;
  line-height: normal;
}

.sheet__divider {
  height: 1rpx;
  margin-top: 32rpx;
  background: rgba(0, 0, 0, 0.08);
}

.sheet__picker-wrap {
  position: relative;
  height: 432rpx;
  margin-top: 8rpx;
}

.sheet__pv {
  height: 432rpx;
  width: 100%;
}

.sheet__pv-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120rpx;
}

.sheet__pv-tx {
  font-size: 32rpx;
  font-weight: 400;
  color: #31233a;
  line-height: normal;
}

.sheet__indicator {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 120rpx;
  pointer-events: none;
  z-index: 2;
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.sheet__shade {
  position: absolute;
  left: 0;
  right: 0;
  height: 120rpx;
  pointer-events: none;
  z-index: 3;
}

.sheet__shade--top {
  top: 50%;
  transform: translateY(-180rpx);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.sheet__shade--bottom {
  top: 50%;
  transform: translateY(60rpx);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.sheet__btn {
  margin: 24rpx 60rpx 0;
  height: 92rpx;
  border-radius: 100rpx;
  background: linear-gradient(47.18deg, $match-purple-light 11.9%, $match-purple 94.02%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet__btn-tx {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: normal;
}
</style>
