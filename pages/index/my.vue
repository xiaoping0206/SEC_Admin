<template>
  <view class="root">
    <!-- 区块1：导航栏 -->
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px', height: navContentPx + 'px' }">
      <text class="nav__ttl">MY</text>
    </view>

    <scroll-view
      scroll-y
      class="sv"
      :style="{ height: scrollHeightPx + 'px', marginTop: navOuterPx + 'px' }"
      :show-scrollbar="false"
    >
      <view class="canvas">
        <!-- 区块2：账户信息卡片 -->
        <view class="card">
          <view class="card-content">
            <view class="card-ava">
              <image class="card-ava__img" :src="avatarDisplay" mode="aspectFill" />
            </view>

            <view class="card-col">
              <text class="card-name">{{ institutionName }}</text>
              <text v-if="accountSubtitle" class="card-sub">{{ accountSubtitle }}</text>
              <view class="card-tags">
                <view v-for="(t, idx) in tagsListLimited" :key="t.id ?? idx" class="card-pill">
                  <text class="card-pill__txt">{{ t.label }}</text>
                </view>
              </view>
              <text class="card-id">ID：{{ organizationId }}</text>
            </view>

            <view class="edit" @tap="goAccount">
              <view class="edit__blue">
                <u-icon name="edit-pen" color="#FFFFFF" size="26" />
              </view>
            </view>
          </view>
        </view>

        <!-- 区块3：分割线 -->
        <view class="sep" />

        <!-- 区块4：档案管理 -->
        <view class="row row--files" @tap="goFiles" />
        <view class="ico ico--files">
          <u-icon name="list" color="#FFFFFF" size="26" />
        </view>
        <text class="cap cap--files">档案管理</text>
        <view class="arr arr--files">
          <u-icon name="arrow-right" color="#BFBFBF" size="20" />
        </view>

        <!-- 区块5：设置 -->
        <view class="row row--set" @tap="goSettings" />
        <view class="ico ico--set">
          <u-icon name="setting" color="#FFFFFF" size="26" />
        </view>
        <text class="cap cap--set">设置</text>
        <view class="arr arr--set">
          <u-icon name="arrow-right" color="#BFBFBF" size="20" />
        </view>
      </view>
    </scroll-view>

    <!-- 区块6：底部 Tab -->
    <view class="tb">
      <view class="tb__it" @tap="goTab('/pages/matching/index')">
        <image class="tb__pic" src="/static/images/tab/match.png" mode="aspectFit" />
        <text class="tb__lbl">匹配</text>
      </view>
      <view class="tb__it" @tap="goTab('/pages/message/index')">
        <image class="tb__pic" src="/static/images/tab/message.png" mode="aspectFit" />
        <text class="tb__lbl">消息</text>
      </view>
      <view class="tb__it tb__it--on" @tap="goTab('/pages/index/my')">
        <image
          class="tb__pic tb__pic--on"
          src="/static/images/tab/my-active.png"
          mode="aspectFit"
        />
        <text class="tb__lbl tb__lbl--on">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'

const AVATAR_FALLBACK = '/static/images/default-avatar.png'

const statusBarPx = ref(20)
const scrollHeightPx = ref(500)
const navContentPx = ref(88)
const navOuterPx = ref(108)

const userStore = useUserStore()

const {
  avatar,
  institutionName,
  accountSubtitle,
  organizationId,
  tags
} = storeToRefs(userStore)

const tagsList = computed(() =>
  Array.isArray(tags.value) ? tags.value : []
)

const tagsListLimited = computed(() => tagsList.value.slice(0, 2))

const avatarDisplay = computed(
  () => (avatar.value && String(avatar.value).length > 0 ? avatar.value : AVATAR_FALLBACK)
)

function layoutSizes() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navContentPx.value = uni.upx2px(176)
  navOuterPx.value = statusBarPx.value + navContentPx.value
  const bot = uni.upx2px(126)
  scrollHeightPx.value = s.windowHeight - navOuterPx.value - bot
}

onMounted(async () => {
  layoutSizes()
  await userStore.init()
})

function goAccount() {
  uni.navigateTo({ url: '/pages/my/account' })
}

function goFiles() {
  uni.navigateTo({ url: '/pages/admin/files' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/my/settings' })
}

function goTab(url) {
  uni.reLaunch({ url })
}
</script>

<style lang="scss" scoped>
.root {
  min-height: 100vh;
  background: #f5f7fa;
  box-sizing: border-box;
}

/* 基准 812×375：坐标 ×2 = rpx，转 px 时用 upx2px */
.nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 750rpx;
  z-index: 100;
  background: #ffffff;
  box-sizing: content-box;
}

.nav__ttl {
  position: absolute;
  left: 60rpx;
  top: 90rpx;
  font-size: 64rpx;
  font-weight: 700;
  color: #383838;
  line-height: 1;
}

.sv {
  width: 750rpx;
  box-sizing: border-box;
}

.canvas {
  position: relative;
  width: 750rpx;
  height: 1624rpx;
  padding-bottom: 126rpx;
  box-sizing: border-box;
}

.card {
  position: absolute;
  left: 40rpx;
  top: 200rpx;
  width: 670rpx;
  min-height: 422rpx;
  background: #efefef;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.card-content {
  position: relative;
  width: 670rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding: 40rpx;
  gap: 24rpx;
}

.card-ava {
  width: 152rpx;
  height: 152rpx;
  border-radius: 76rpx;
  background: #e8e8e8;
  overflow: hidden;
  flex-shrink: 0;
}

.card-ava__img {
  width: 152rpx;
  height: 152rpx;
}

.card-col {
  flex: 1;
  min-width: 0;
  padding-right: 112rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.card-name {
  font-size: 48rpx;
  font-weight: 700;
  color: #1a1a2e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-sub {
  font-size: 28rpx;
  color: #666666;
}

.card-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8rpx;
  align-items: center;
}

.card-pill {
  border-width: 1rpx;
  border-style: solid;
  border-color: #4a90e2;
  border-radius: 28rpx;
  padding: 8rpx 24rpx;
  box-sizing: border-box;
}

.card-pill__txt {
  font-size: 24rpx;
  color: #4a90e2;
}

.card-id {
  font-size: 24rpx;
  color: #999999;
}

.edit {
  position: absolute;
  right: 40rpx;
  top: 40rpx;
  width: 96rpx;
  height: 96rpx;
}

.edit__blue {
  width: 96rpx;
  height: 96rpx;
  border-radius: 16rpx;
  background: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sep {
  position: absolute;
  left: 310rpx;
  top: 682rpx;
  width: 128rpx;
  height: 2rpx;
  background: #e8e8e8;
}

.row {
  position: absolute;
  left: 40rpx;
  width: 670rpx;
  height: 100rpx;
  background: #ffffff;
  border-radius: 32rpx;
}

.row--files {
  top: 710rpx;
}

.row--set {
  top: 834rpx;
}

.ico {
  position: absolute;
  width: 52rpx;
  height: 52rpx;
  border-radius: 12rpx;
  background: #4a90e2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ico--files {
  left: 76rpx;
  top: 724rpx;
}

.ico--set {
  left: 76rpx;
  top: 848rpx;
}

.cap {
  position: absolute;
  font-size: 34rpx;
  color: #1a1a2e;
}

.cap--files {
  left: 140rpx;
  top: 736rpx;
}

.cap--set {
  left: 140rpx;
  top: 860rpx;
}

.arr {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arr--files {
  left: 662rpx;
  top: 740rpx;
}

.arr--set {
  left: 662rpx;
  top: 864rpx;
}

.tb {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 750rpx;
  height: 126rpx;
  background: #ffffff;
  box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.06);
  z-index: 100;
}

.tb__it {
  position: absolute;
  top: 0;
  width: 250rpx;
  height: 126rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.tb__it:nth-child(1) {
  left: 0;
}

.tb__it:nth-child(2) {
  left: 250rpx;
}

.tb__it:nth-child(3) {
  left: 500rpx;
}

.tb__pic {
  width: 80rpx;
  height: 80rpx;
}

.tb__pic--on {
  border-radius: 20rpx;
}

.tb__lbl {
  margin-top: 8rpx;
  font-size: 20rpx;
  color: #666666;
  line-height: 1;
}

.tb__lbl--on {
  color: #4a90e2;
  font-weight: 600;
}
</style>
