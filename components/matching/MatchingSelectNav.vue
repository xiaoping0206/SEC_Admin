<template>
  <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
    <view class="nav__bar" :style="{ height: barPx + 'px' }">
      <view class="nav__back" @tap="emit('back')">
        <image class="nav__back-ico" src="/static/figma/matching/select/ic_back.svg" mode="aspectFit" />
      </view>
      <text class="nav__ttl ff-yuan">{{ title }}</text>
      <view class="nav__search" @tap="emit('search')">
        <image class="nav__search-ico" src="/static/figma/matching/select/ic_search.png" mode="aspectFit" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

defineProps({
  title: { type: String, required: true }
})

const emit = defineEmits(['back', 'search'])

const statusBarPx = ref(20)
const barPx = ref(44)

onMounted(() => {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  barPx.value = uni.upx2px(88)
})
</script>

<style lang="scss" scoped>
.nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: transparent;
}

.nav__bar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__back {
  position: absolute;
  left: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__back-ico {
  width: 24rpx;
  height: 48rpx;
}

.nav__ttl {
  font-size: 34rpx;
  font-weight: 600;
  color: rgba(49, 35, 58, 0.9);
  line-height: normal;
}

.nav__search {
  position: absolute;
  right: 166rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 64rpx;
  height: 64rpx;
  border-radius: 40rpx;
  background: #f8f8f8;
  border: 1rpx solid #e4e4e4;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav__search-ico {
  width: 32rpx;
  height: 32rpx;
}
</style>
