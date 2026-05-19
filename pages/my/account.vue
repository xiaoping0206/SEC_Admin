<template>
  <view class="page">
    <view class="card">
      <view class="row" @tap="onAvatarTap">
        <text class="row__label">头像</text>
        <image class="row__thumb" :src="avatar" mode="aspectFill" />
        <text class="row__value">{{ avatarHint }}</text>
        <u-icon name="arrow-right" color="#B0B7C3" size="16" />
      </view>

      <view class="hline" />

      <view class="row" @tap="onTodo">
        <text class="row__label">机构名称</text>
        <text class="row__value ellipsis">{{ institutionName }}</text>
        <u-icon name="arrow-right" color="#B0B7C3" size="16" />
      </view>

      <view class="hline" />

      <view class="row" @tap="onTodo">
        <text class="row__label">账号类型</text>
        <text class="row__value ellipsis">{{ accountTypeDisplay }}</text>
        <u-icon name="arrow-right" color="#B0B7C3" size="16" />
      </view>

      <view class="hline" />

      <view class="row" @tap="onTodo">
        <text class="row__label">联系方式</text>
        <text class="row__value">{{ mobileMasked }}</text>
        <u-icon name="arrow-right" color="#B0B7C3" size="16" />
      </view>

      <view class="hline" />

      <view class="row" @tap="onTodo">
        <text class="row__label">微信绑定</text>
        <text class="row__value ellipsis">{{ wxLabel }}</text>
        <u-icon name="arrow-right" color="#B0B7C3" size="16" />
      </view>
    </view>

    <!-- TODO: 下期支持头像上传、字段在线编辑 -->
  </view>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const {
  avatar,
  institutionName,
  accountTypeDisplay,
  wechatNickname,
  mobileMasked
} = storeToRefs(userStore)

const avatarHint = computed(() => '头像')
const wxLabel = computed(() => {
  const n = wechatNickname.value
  return n && String(n).trim() ? n : '未绑定'
})

onMounted(() => {
  userStore.init()
})

function onAvatarTap() {
  uni.showToast({ title: '暂不支持更换头像', icon: 'none' })
}

function onTodo() {
  uni.showToast({ title: '敬请期待', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  padding: $spacing-xl $spacing-md;
  background: $color-bg;
  box-sizing: border-box;
}

.card {
  background: $color-bg-card;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  overflow: hidden;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 96rpx;
  padding: 0 $spacing-md;
}

.row__label {
  width: 180rpx;
  font-size: $font-size-base;
  color: $color-text-primary;
  flex-shrink: 0;
}

.row__thumb {
  width: 56rpx;
  height: 56rpx;
  border-radius: $radius-full;
  margin-right: $spacing-md;
}

.row__value {
  flex: 1;
  min-width: 0;
  text-align: right;
  font-size: $font-size-base;
  color: $color-text-secondary;
  margin-right: $spacing-xs;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hline {
  height: 1px;
  background: $color-border;
  margin-left: $spacing-md;
}
</style>
