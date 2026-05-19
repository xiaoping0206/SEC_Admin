<template>
  <view class="empty" :style="{ paddingTop: padTopPx + 'px' }">
    <image
      class="empty__illus"
      src="/static/figma/matching/select/empty_illus.png"
      mode="aspectFit"
    />
    <text class="empty__hint ff-yuan">列表还是空的，去新建吧</text>
    <view class="empty__btn" @tap="emit('create')">
      <text class="empty__btn-tx ff-yuan">{{ createLabel }}</text>
    </view>
  </view>
</template>

<script setup>
defineProps({
  /** Figma 3588:7715 新建老人 / 3588:7773 新建护工 */
  createLabel: {
    type: String,
    required: true
  },
  padTopPx: {
    type: Number,
    default: 187
  }
})

const emit = defineEmits(['create'])
</script>

<style lang="scss" scoped>
$match-purple: #9245f9;
$match-purple-light: #c766ff;

/* Figma 3588:7706 / 3588:7765 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding-bottom: 80rpx;
}

/* Figma 3588:7718 — 89×89 */
.empty__illus {
  width: 178rpx;
  height: 178rpx;
  display: block;
  flex-shrink: 0;
}

/* Figma 3588:7712 — 插图底 364 → 文案顶 372，间距 8px */
.empty__hint {
  margin-top: 16rpx;
  font-size: 26rpx;
  font-weight: 500;
  color: #31233a;
  line-height: 26rpx;
  text-align: center;
}

/* Figma 3588:7713 — 文案底 ~385 → 按钮顶 458，间距 ~73px */
.empty__btn {
  margin-top: 146rpx;
  min-width: 280rpx;
  height: 92rpx;
  padding: 0 48rpx;
  border-radius: 100rpx;
  background: linear-gradient(67.62deg, $match-purple-light 11.9%, $match-purple 94.02%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.empty__btn-tx {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: normal;
  white-space: nowrap;
}
</style>
