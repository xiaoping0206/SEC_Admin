<template>
  <view class="tb" :class="{ 'tb--light': props.theme === 'light' }">
    <view class="tb__bar">
      <view v-for="t in tabList" :key="t.key" class="tb__it" @tap="go(t)">
        <view class="tb__ico" :class="{ 'tb__ico--on': props.active === t.key }">
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
import { computed } from 'vue'

const props = defineProps({
  active: { type: String, required: true },
  /** gray：我的页灰底栏；light：匹配首页 Figma 3588:6764 白底紫影栏 */
  theme: { type: String, default: 'gray' }
})

const tabsGray = [
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

const tabsLight = [
  {
    key: 'matching',
    label: '匹配',
    path: '/pages/matching/index',
    icon: '/static/figma/matching/tb_match.png'
  },
  {
    key: 'message',
    label: '消息',
    path: '/pages/message/index',
    icon: '/static/figma/matching/tb_message.png'
  },
  {
    key: 'my',
    label: '我的',
    path: '/pages/index/my',
    icon: '/static/figma/matching/tb_my.png'
  }
]

const tabList = computed(() => (props.theme === 'light' ? tabsLight : tabsGray))

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

.tb--light .tb__bar {
  margin: 0 40rpx;
  padding: 4rpx 0 18rpx;
  min-height: 130rpx;
  border-radius: 100rpx;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8rpx 28rpx 2rpx #d4b4ff;
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

.tb__ico--on {
  background: #cfcfcf;
}

.tb--light .tb__ico {
  width: 80rpx;
  height: 72rpx;
  border-radius: 0;
  background: transparent;
}

.tb--light .tb__ico--on {
  background: transparent;
}

.tb__img {
  width: 68rpx;
  height: 68rpx;
}

.tb--light .tb__img {
  width: 80rpx;
  height: 72rpx;
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

.tb--light .tb__tx {
  font-size: 20rpx;
  font-weight: 600;
  color: #695d71;
}

.tb__tx--on {
  color: #383838;
  font-weight: 600;
}

.tb--light .tb__tx--on {
  color: #31233a;
}

.tb__safe {
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
  background: #ededed;
}

.tb--light .tb__safe {
  background: transparent;
}
</style>
