<template>
  <view class="page">
    <MatchingHomeCanvas />

    <!-- 多人匹配：Figma 3588:6799 @ 19,572 -->
    <view class="card-hit card-hit--multi" @tap="openMulti" />
    <!-- 单人匹配：Figma 3588:6798 @ 195,572 -->
    <view class="card-hit card-hit--single" @tap="openSingle" />

    <!-- 底栏：Figma 3588:6764 — 335×65 @ 20,733 -->
    <view class="tabbar">
      <view class="tabbar__bg" />
      <view class="tabbar__it tabbar__it--match" @tap="goTab('matching')">
        <image class="tabbar__ico tabbar__ico--match" src="/static/figma/matching/tb_match.png" mode="aspectFit" />
        <text class="tabbar__tx tabbar__tx--on ff-yuan">匹配</text>
      </view>
      <view class="tabbar__it tabbar__it--msg" @tap="goTab('message')">
        <image class="tabbar__ico tabbar__ico--msg" src="/static/figma/matching/tb_message.png" mode="aspectFit" />
        <text class="tabbar__tx ff-yuan">消息</text>
      </view>
      <view class="tabbar__it tabbar__it--my" @tap="goTab('my')">
        <image class="tabbar__ico tabbar__ico--my" src="/static/figma/matching/tb_my.png" mode="aspectFit" />
        <text class="tabbar__tx ff-yuan">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import MatchingHomeCanvas from '@/components/matching/MatchingHomeCanvas.vue'
import { useMatchingStore } from '@/store/matching'

const matchingStore = useMatchingStore()

const tabPaths = {
  matching: '/pages/matching/index',
  message: '/pages/message/index',
  my: '/pages/index/my'
}

function goTab(key) {
  if (key === 'matching') return
  uni.reLaunch({ url: tabPaths[key] })
}

function openMulti() {
  matchingStore.setMatchMode('multi')
  uni.navigateTo({ url: '/pages/matching/multi' })
}

function openSingle() {
  matchingStore.setMatchMode('single')
  uni.navigateTo({ url: '/pages/matching/single' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

$page-purple-light: #fbf8ff;
$page-purple-deep: #eadaff;

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, $page-purple-light 0%, $page-purple-deep 100%);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* 透明点击层，对齐 Figma 卡片区域 */
.card-hit {
  position: absolute;
  top: 1144rpx;
  width: 320rpx;
  height: 200rpx;
  z-index: 10;
}

.card-hit--multi {
  left: 38rpx;
}

.card-hit--single {
  left: 390rpx;
}

/* 底栏 3588:6764 — 335×65 @ 20,733 */
.tabbar {
  position: fixed;
  left: 40rpx;
  width: 670rpx;
  height: 130rpx;
  bottom: calc(28rpx + env(safe-area-inset-bottom));
  z-index: 900;
}

.tabbar__bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 30rpx;
  bottom: 0;
  border-radius: 100rpx;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8rpx 28rpx 2rpx #d4b4ff;
}

.tabbar__it {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.tabbar__it--match {
  left: 72rpx;
  top: 4rpx;
  width: 80rpx;
}

.tabbar__it--msg {
  left: 294rpx;
  top: 0;
  width: 94rpx;
}

.tabbar__it--my {
  left: 518rpx;
  top: 6rpx;
  width: 78rpx;
}

.tabbar__ico {
  display: block;
}

.tabbar__ico--match {
  width: 80rpx;
  height: 72rpx;
}

.tabbar__ico--msg {
  width: 94rpx;
  height: 94rpx;
  margin-top: -12rpx;
}

.tabbar__ico--my {
  width: 78rpx;
  height: 78rpx;
}

.tabbar__tx {
  margin-top: 4rpx;
  font-size: 20rpx;
  font-weight: 600;
  line-height: normal;
  color: #695d71;
  text-align: center;
  white-space: nowrap;
}

.tabbar__tx--on {
  color: #31233a;
}
</style>
