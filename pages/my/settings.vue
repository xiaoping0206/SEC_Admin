<template>
  <view class="page">
    <!-- Figma 3588:9379 导航栏（仅返回，无标题） -->
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/matching/select/ic_back.svg"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>

    <view class="body" :style="{ paddingTop: navOuterPx + 'px' }">
      <!-- Figma 3588:9374 规则管理 @ 20,110 -->
      <view class="menu" @tap="goUploadRules">
        <image
          class="menu__ico"
          src="/static/figma/my/ic_rules_upload.png"
          mode="aspectFit"
        />
        <text class="menu__tx ff-yuan">规则管理</text>
        <view class="menu__chev" aria-hidden="true" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)

onMounted(() => {
  layoutNav()
})

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
}

function goBack() {
  uni.navigateBack()
}

function goUploadRules() {
  uni.navigateTo({ url: '/pages/admin/upload-rules' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* Figma 3588:9372 — 375×812，1px = 2rpx */
.page {
  min-height: 100vh;
  background: #f0e8fb;
  box-sizing: border-box;
}

.nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: #f0e8fb;
}

.nav__bar {
  position: relative;
  display: flex;
  align-items: center;
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

.body {
  padding-left: 40rpx;
  padding-right: 40rpx;
  box-sizing: border-box;
}

.menu {
  margin-top: 32rpx;
  width: 670rpx;
  height: 100rpx;
  border-radius: 80rpx;
  background: #ffffff;
  padding: 0 36rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
}

.menu__ico {
  width: 52rpx;
  height: 52rpx;
  flex-shrink: 0;
}

.menu__tx {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #31233a;
  line-height: 1.2;
}

.menu__chev {
  width: 14rpx;
  height: 14rpx;
  border-top: 3rpx solid #ddc7f9;
  border-right: 3rpx solid #ddc7f9;
  transform: rotate(45deg);
  box-sizing: border-box;
  flex-shrink: 0;
}
</style>
