<template>
  <view v-if="shown" class="mask" @tap="emit('close')">
    <view class="sheet" @tap.stop>
      <text class="sheet__title ff-yuan">MBTI</text>
      <view class="sheet__divider" />

      <view class="mbti-grid">
        <view v-for="(pair, col) in mbtiPairs" :key="'col-' + col" class="mbti-col">
          <text class="mbti-col__lab ff-yuan">{{ mbtiTopLabels[col] }}</text>
          <view
            class="mbti-col__cell"
            :class="{ 'mbti-col__cell--on': draft[col] === pair[0] }"
            @tap="setMbti(col, pair[0])"
          >
            <text
              class="mbti-col__letter ff-yuan"
              :class="{ 'mbti-col__letter--on': draft[col] === pair[0] }"
            >
              {{ pair[0] }}
            </text>
          </view>
          <view
            class="mbti-col__cell"
            :class="{ 'mbti-col__cell--on': draft[col] === pair[1] }"
            @tap="setMbti(col, pair[1])"
          >
            <text
              class="mbti-col__letter ff-yuan"
              :class="{ 'mbti-col__letter--on': draft[col] === pair[1] }"
            >
              {{ pair[1] }}
            </text>
          </view>
          <text class="mbti-col__lab mbti-col__lab--bot ff-yuan">{{ mbtiBotLabels[col] }}</text>
        </view>
      </view>

      <view class="sheet__btn" @tap="onConfirm">
        <text class="sheet__btn-tx ff-yuan">确定</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const mbtiPairs = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P']
]
const mbtiTopLabels = ['外向', '实感', '理智', '判断']
const mbtiBotLabels = ['内向', '直觉', '情感', '感知']

const props = defineProps({
  shown: { type: Boolean, default: false },
  initialValue: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])

const draft = ref(['', '', '', ''])

const mbtiResult = computed(() => {
  if (draft.value.every((x) => x && x.length === 1)) return draft.value.join('')
  return ''
})

watch(
  () => props.shown,
  (v) => {
    if (!v) return
    const s = String(props.initialValue || '').trim()
    draft.value = s.length === 4 ? s.split('') : ['', '', '', '']
  }
)

watch(
  () => props.initialValue,
  () => {
    if (!props.shown) return
    const s = String(props.initialValue || '').trim()
    draft.value = s.length === 4 ? s.split('') : ['', '', '', '']
  }
)

function setMbti(col, letter) {
  const next = [...draft.value]
  next[col] = next[col] === letter ? '' : letter
  draft.value = next
}

function onConfirm() {
  const s = mbtiResult.value
  if (s.length !== 4) {
    uni.showToast({ title: '请完成四列选择', icon: 'none' })
    return
  }
  emit('confirm', s)
}
</script>

<style lang="scss" scoped>
$match-purple: #9245f9;
$match-purple-light: #c766ff;

/* Figma 3588:8252 设置 MBTI */
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

.mbti-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 40rpx 54rpx 32rpx;
  box-sizing: border-box;
}

.mbti-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.mbti-col__lab {
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: normal;
  white-space: nowrap;
}

.mbti-col__lab:first-child {
  margin-bottom: 24rpx;
}

.mbti-col__lab--bot {
  margin-top: 24rpx;
}

.mbti-col__cell {
  width: 100rpx;
  height: 100rpx;
  border-radius: 62rpx;
  background: #f6eeff;
  border: 4rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}

.mbti-col__cell:last-of-type {
  margin-bottom: 0;
}

.mbti-col__cell--on {
  background: #ffffff;
  border-color: $match-purple;
}

.mbti-col__letter {
  font-size: 32rpx;
  font-weight: 400;
  color: #8d7a99;
  line-height: normal;
}

.mbti-col__letter--on {
  font-weight: 700;
  color: $match-purple;
}

.sheet__btn {
  margin: 8rpx 60rpx 0;
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
