<template>
  <view class="login-page">
    <view class="logo-area">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">老年福利护理匹配系统</text>
    </view>

    <view class="action-area">
      <button class="btn-wechat" open-type="getPhoneNumber" @getphonenumber="onWechatLogin">
        微信一键登录
      </button>
    </view>
  </view>
</template>

<script setup>
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

async function onWechatLogin(e) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') return
  await userStore.loginWithWechat(e.detail)
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: $page-padding-x;
  background-color: $color-bg;
}

.logo-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-2xl;

  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: $spacing-md;
  }

  .app-name {
    font-size: $font-size-lg;
    font-weight: $font-weight-bold;
    color: $color-text-primary;
  }
}

.action-area {
  width: 100%;

  .btn-wechat {
    width: 100%;
    height: 96rpx;
    background-color: $color-primary;
    color: #fff;
    font-size: $font-size-base;
    font-weight: $font-weight-medium;
    border-radius: $radius-full;
  }
}
</style>
