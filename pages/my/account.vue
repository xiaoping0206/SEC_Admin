<template>
  <view class="page">
    <!-- Figma 3588:9090 导航栏 -->
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/matching/select/ic_back.svg"
            mode="aspectFit"
          />
        </view>
        <text class="nav__ttl ff-yuan">账号资料</text>
      </view>
    </view>

    <view class="body" :style="{ paddingTop: navOuterPx + 'px' }">
      <!-- Figma 3588:9091 资料卡 335×235 @ 20,104 -->
      <view class="card">
        <view class="row" @tap="onAvatarTap">
          <text class="row__label ff-yuan">头像</text>
          <view class="row__right">
            <image class="row__avatar" :src="avatarDisplay" mode="aspectFill" />
            <view class="row__chev" aria-hidden="true" />
          </view>
        </view>

        <view class="sep" />

        <view class="row row--id">
          <text class="row__label ff-yuan">SECare ID：{{ organizationId }}</text>
          <text class="row__copy ff-yuan" @tap.stop="copyId">复制</text>
        </view>

        <view class="sep" />

        <view class="row" @tap="onTodo">
          <text class="row__label ff-yuan">昵称</text>
          <view class="row__right">
            <text class="row__value ff-yuan">{{ institutionName }}</text>
            <view class="row__chev" aria-hidden="true" />
          </view>
        </view>

        <view class="sep" />

        <view class="row" @tap="onTodo">
          <text class="row__label ff-yuan">服务定位</text>
          <view class="row__right">
            <text class="row__value ff-yuan">{{ serviceTagLabel }}</text>
            <view class="row__chev" aria-hidden="true" />
          </view>
        </view>

        <view class="sep" />

        <view class="row row--last" @tap="onTodo">
          <text class="row__label ff-yuan">登记性质</text>
          <view class="row__right">
            <text class="row__value ff-yuan">{{ orgTagLabel }}</text>
            <view class="row__chev" aria-hidden="true" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'

const AVATAR_FALLBACK = '/static/figma/my/avatar_ellipse19.png'
const AVATAR_GRAY = '/static/images/avatar-mine-placeholder.png'

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)

const userStore = useUserStore()
const { avatar, institutionName, organizationId, tags } = storeToRefs(userStore)

const tagsList = computed(() => (Array.isArray(tags.value) ? tags.value : []))

const serviceTagLabel = computed(() => tagsList.value[0]?.label || '普惠')

const orgTagLabel = computed(() => tagsList.value[1]?.label || '非营利性养老机构')

const avatarDisplay = computed(() => {
  const src = avatar.value && String(avatar.value).length > 0 ? avatar.value : AVATAR_FALLBACK
  if (
    src === AVATAR_GRAY ||
    src.endsWith('avatar-mine-placeholder.png') ||
    src.endsWith('default-avatar.png')
  ) {
    return AVATAR_FALLBACK
  }
  return src
})

onMounted(() => {
  layoutNav()
  userStore.init()
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

function copyId() {
  uni.setClipboardData({
    data: String(organizationId.value || ''),
    success() {
      uni.showToast({ title: '已复制', icon: 'success' })
    }
  })
}

function onAvatarTap() {
  uni.showToast({ title: '暂不支持更换头像', icon: 'none' })
}

function onTodo() {
  uni.showToast({ title: '敬请期待', icon: 'none' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* Figma 3588:9088 — 375×812，1px = 2rpx */
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

.body {
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 48rpx;
  box-sizing: border-box;
}

.card {
  margin-top: 32rpx;
  width: 670rpx;
  min-height: 470rpx;
  border-radius: 40rpx;
  background: #fafafa;
  overflow: hidden;
  box-sizing: border-box;
}

.row {
  min-height: 94rpx;
  padding: 0 40rpx;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.row--id {
  min-height: 94rpx;
}

.row--last {
  min-height: 94rpx;
}

.row__label {
  flex-shrink: 0;
  font-size: 28rpx;
  font-weight: 500;
  color: #31233a;
  line-height: 1.2;
}

.row__right {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
}

.row__avatar {
  width: 56rpx;
  height: 56rpx;
  border-radius: 28rpx;
  flex-shrink: 0;
}

.row__value {
  max-width: 360rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: 1.2;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row__copy {
  font-size: 28rpx;
  font-weight: 500;
  color: #e32525;
  line-height: 1.2;
  flex-shrink: 0;
}

.row__chev {
  width: 14rpx;
  height: 14rpx;
  border-top: 3rpx solid #ddc7f9;
  border-right: 3rpx solid #ddc7f9;
  transform: rotate(45deg);
  box-sizing: border-box;
  flex-shrink: 0;
}

.sep {
  margin-left: 40rpx;
  margin-right: 40rpx;
  height: 2rpx;
  background: #efe8f5;
}
</style>
