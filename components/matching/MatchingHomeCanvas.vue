<template>
  <view class="canvas">
    <!-- LOGO：Figma 3588:6763 @ 8,40 186×64 -->
    <image
      class="logo"
      src="/static/figma/matching/logo_sec.png"
      mode="aspectFit"
    />

    <!-- 雷达：Figma 3588:6765 @ center top116 415×415 -->
    <image
      class="radar"
      src="/static/figma/matching/radar_scene.png"
      mode="aspectFit"
    />

    <!-- 多人匹配：Figma 3588:6799 @ 19,572 -->
    <view class="card card--multi">
      <view class="card__bg" />
      <text class="card__tit ff-yuan">多人匹配</text>
      <text class="card__sub ff-yuan">选择匹配的老人</text>
      <view class="card__pill">
        <text class="card__pill-txt ff-yuan">开始匹配</text>
      </view>
      <image
        class="card__illus card__illus--multi"
        src="/static/figma/matching/card_multi_figure.png"
        mode="scaleToFill"
      />
    </view>

    <!-- 单人匹配：Figma 3588:6798 @ 195,572 -->
    <view class="card card--single">
      <view class="card__bg" />
      <text class="card__tit card__tit--single ff-yuan">单人匹配</text>
      <text class="card__sub card__sub--single ff-yuan">选择匹配的老人和护工</text>
      <view class="card__pill card__pill--single">
        <text class="card__pill-txt card__pill-txt--single ff-yuan">开始匹配</text>
      </view>
      <image
        class="card__figure"
        src="/static/figma/matching/card_single_figure.png"
        mode="scaleToFill"
      />
    </view>
  </view>
</template>

<script setup>
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

$page-purple-light: #fbf8ff;
$page-purple-deep: #eadaff;
$match-purple: #9245f9;
$match-purple-mid: #c091ff;

.canvas {
  position: relative;
  width: 750rpx;
  min-height: 1624rpx;
  margin: 0 auto;
  box-sizing: border-box;
}

.logo {
  position: absolute;
  left: 16rpx;
  top: 80rpx;
  width: 372rpx;
  height: 128rpx;
  z-index: 2;
}

.radar {
  position: absolute;
  left: 50%;
  top: 232rpx;
  width: 830rpx;
  height: 830rpx;
  transform: translateX(-50%);
  z-index: 1;
}

.card {
  position: absolute;
  top: 1144rpx;
  width: 320rpx;
  height: 200rpx;
  border-radius: 32rpx;
  overflow: hidden;
  z-index: 2;
  box-sizing: border-box;
}

.card--multi {
  left: 38rpx;
}

.card--single {
  left: 390rpx;
}

.card__bg {
  position: absolute;
  inset: 0;
  border-radius: 32rpx;
  background: linear-gradient(
    65.89deg,
    $match-purple 4.61%,
    $match-purple-mid 94.41%
  );
}

.card__tit {
  position: absolute;
  left: 28rpx;
  top: 30rpx;
  z-index: 2;
  font-size: 30rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: normal;
}

.card__sub {
  position: absolute;
  left: 28rpx;
  top: 70rpx;
  z-index: 2;
  font-size: 16rpx;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.3);
  line-height: normal;
  max-width: 148rpx;
}

.card__pill {
  position: absolute;
  left: 20rpx;
  bottom: 20rpx;
  z-index: 2;
  width: 120rpx;
  height: 44rpx;
  border-radius: 40rpx;
  background: rgba(72, 0, 169, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card__pill-txt {
  font-size: 20rpx;
  font-weight: 600;
  color: #e1c8ff;
  line-height: normal;
}

.card__illus {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}

.card__illus--multi {
  left: 128rpx;
  top: 16rpx;
  width: 192rpx;
  height: 184rpx;
}

.card__tit--single {
  left: 28rpx;
  top: 30rpx;
}

.card__sub--single {
  left: 28rpx;
  top: 70rpx;
  max-width: 160rpx;
}

.card__pill--single {
  left: 20rpx;
  bottom: 20rpx;
  width: 120rpx;
  height: 44rpx;
}

.card__pill-txt--single {
  font-size: 20rpx;
  font-weight: 600;
}

.card__figure {
  position: absolute;
  left: 144rpx;
  top: 0;
  width: 176rpx;
  height: 200rpx;
  z-index: 1;
  pointer-events: none;
}
</style>
