<template>
  <view v-if="visible">
    <view
      style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100"
      @tap="emit('close')"
    />
    <view
      style="position:fixed;bottom:0;left:0;width:100%;max-height:85vh;background:#fff;border-radius:32rpx 32rpx 0 0;z-index:101;padding-bottom:env(safe-area-inset-bottom)"
      @tap.stop
    >
      <view class="hdr">
        <text class="hdr__tit">MBTI</text>
        <text class="hdr__close" @tap="emit('close')">关闭</text>
      </view>

      <view class="body">
        <view class="mbti-hdr">
          <text class="mbti-hdr__c">外向</text>
          <text class="mbti-hdr__c">实感</text>
          <text class="mbti-hdr__c">理智</text>
          <text class="mbti-hdr__c">判断</text>
        </view>
        <view class="mbti-row">
          <view
            v-for="(pair, col) in mbtiPairs"
            :key="'r1-' + col"
            class="mbti-cell"
            @tap="setMbti(col, pair[0])"
          >
            <text class="mbti-cell__l" :class="{ 'mbti-cell__l--on': mbti[col] === pair[0] }">{{ pair[0] }}</text>
          </view>
        </view>
        <view class="mbti-hdr mti-low">
          <text class="mbti-hdr__c">内向</text>
          <text class="mbti-hdr__c">直觉</text>
          <text class="mbti-hdr__c">情感</text>
          <text class="mbti-hdr__c">感知</text>
        </view>
        <view class="mbti-row">
          <view
            v-for="(pair, col) in mbtiPairs"
            :key="'r2-' + col"
            class="mbti-cell"
            @tap="setMbti(col, pair[1])"
          >
            <text class="mbti-cell__l" :class="{ 'mbti-cell__l--on': mbti[col] === pair[1] }">{{ pair[1] }}</text>
          </view>
        </view>
        <text class="sum">当前：{{ mbtiResult || '未选择' }}</text>
      </view>

      <view class="foot">
        <view class="foot__ok" @tap="onConfirm">
          <text class="foot__txt">确定</text>
        </view>
        <text class="foot__cancel" @tap="emit('close')">取消</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  value: { type: String, default: '' }
})

const emit = defineEmits(['close', 'confirm'])

const mbtiPairs = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P']
]

const mbti = ref(['', '', '', ''])

const mbtiResult = computed(() => {
  const p = mbti.value
  if (p.every((x) => x && x.length === 1)) return p.join('')
  return ''
})

watch(
  () => props.visible,
  (v) => {
    if (v) {
      const s = String(props.value || '').trim()
      if (s.length === 4) {
        mbti.value = s.split('')
      } else {
        mbti.value = ['', '', '', '']
      }
    }
  }
)

function setMbti(col, letter) {
  const cur = mbti.value[col]
  const next = [...mbti.value]
  next[col] = cur === letter ? '' : letter
  mbti.value = next
}

function onConfirm() {
  const s = mbtiResult.value
  if (s.length !== 4) {
    uni.showToast({ title: '请完成四列选择', icon: 'none' })
    return
  }
  emit('confirm', s)
  emit('close')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  border-bottom: 1rpx solid #eee;
}

.hdr__tit {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.hdr__close {
  font-size: 28rpx;
  color: #999;
}

.body {
  padding: 24rpx 24rpx 16rpx;
}

.mbti-hdr {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8rpx 8rpx;
}

.mti-low {
  margin-top: 8rpx;
}

.mbti-hdr__c {
  width: 25%;
  text-align: center;
  font-size: 20rpx;
  color: $color-text-secondary;
}

.mbti-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8rpx;
}

.mbti-cell {
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  box-sizing: border-box;
}

.mbti-cell__l {
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  border-radius: 16rpx;
  border: 1rpx solid #ccc;
  background: #fff;
  font-size: 32rpx;
  color: $color-text-secondary;
}

.mbti-cell__l--on {
  background: #4a90e2;
  border-color: #4a90e2;
  color: #fff;
}

.sum {
  display: block;
  text-align: center;
  margin: 24rpx 0 8rpx;
  font-size: $font-size-base;
  color: $color-text-primary;
}

.foot {
  padding: 24rpx 40rpx;
  border-top: 1rpx solid #eee;
}

.foot__ok {
  background: #4a90e2;
  border-radius: 16rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}

.foot__txt {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.foot__cancel {
  display: block;
  text-align: center;
  font-size: 28rpx;
  color: #999;
  padding: 8rpx;
}
</style>
