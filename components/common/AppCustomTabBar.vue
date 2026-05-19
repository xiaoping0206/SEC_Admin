<template>
  <view class="tb">
    <view class="tb__bar">
      <view v-for="t in tabs" :key="t.key" class="tb__it" @tap="go(t)">
        <view
          class="tb__ico"
          :class="{ 'tb__ico--on': props.active === t.key }"
        >
          <image class="tb__img" :src="t.icon" mode="aspectFit" />
        </view>
        <text
          class="tb__tx"
          :class="{ 'tb__tx--on': props.active === t.key }"
        >{{ t.label }}</text>
      </view>
    </view>
    <view class="tb__safe" />
  </view>
</template>

<script setup>
const props = defineProps({
  active: { type: String, required: true }
})

const tabs = [
  {
    key: 'matching',
    label: '匹配',
    path: '/pages/matching/index',
    icon: '/static/figma/my/tb_match.png'
  },
  {
    key: 'message',
    label: '消息',
    path: '/pages/message/index',
    icon: '/static/figma/my/tb_message.png'
  },
  {
    key: 'my',
    label: '我的',
    path: '/pages/index/my',
    icon: '/static/figma/my/tb_my.png'
  }
]

function go(t) {
  if (props.active === t.key) return
  uni.reLaunch({ url: t.path })
}
</script>

<style lang="scss" scoped>
.tb {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 900;
}

.tb__bar {
  margin: 0 54rpx 0;
  padding: 16rpx 32rpx 22rpx;
  min-height: 126rpx;
  border-radius: 40rpx;
  background: #d9d9d9;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
}

.tb__it {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tb__ico {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Figma「我的」底栏稿为灰阶：选中略加深底色，不使用品牌蓝以免与全貌冲突 */
.tb__ico--on {
  background: #cfcfcf;
}

.tb__img {
  width: 68rpx;
  height: 68rpx;
}

.tb__tx {
  margin-top: 8rpx;
  padding-bottom: 4rpx;
  font-size: 22rpx;
  font-weight: 400;
  line-height: 1.1;
  color: #626262;
  text-align: center;
}

.tb__tx--on {
  color: #383838;
  font-weight: 600;
}

.tb__safe {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  background: #ededed;
}
</style>
