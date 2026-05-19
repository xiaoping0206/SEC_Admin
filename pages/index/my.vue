<template>
  <view class="page">
    <scroll-view scroll-y class="scroll" :show-scrollbar="false">
      <view class="canvas">
        <!-- Figma 3588:9333 — My! LOGO @ 8,40 186×64 -->
        <image
          class="logo"
          src="/static/figma/my/logo_my.png"
          mode="aspectFit"
        />

        <!-- Figma 3588:9337 — 资料卡 Subtract 渐变底 -->
        <view class="profile">
          <image
            class="profile__bg"
            src="/static/figma/my/card_subtract.png"
            mode="scaleToFill"
          />
          <image
            class="profile__avatar"
            :src="avatarDisplay"
            mode="aspectFill"
          />
          <view class="profile__edit" @tap="goAccount">
            <text class="profile__edit-tx ff-yuan">编辑</text>
          </view>
          <text class="profile__name ff-yuan">{{ institutionName }}</text>
          <text class="profile__id ff-pop">ID：{{ organizationId }}</text>
          <view class="profile__tags">
            <view
              v-for="(t, idx) in tagsListLimited"
              :key="t.id ?? idx"
              class="profile__pill"
            >
              <text class="profile__pill-tx ff-yuan">{{ t.label }}</text>
            </view>
          </view>
        </view>

        <!-- Figma 3588:9365 — 周报推送 -->
        <view v-if="showWeekly" class="weekly" @tap="goWeekly">
          <view class="weekly__card">
            <image
              class="weekly__illus"
              src="/static/figma/my/weekly_card_illus.png"
              mode="scaleToFill"
            />
            <text class="weekly__tit ff-my">周报推送</text>
            <text class="weekly__sub ff-pop">{{ weeklyPeriodLabel }}</text>
            <view class="weekly__close" @tap.stop="dismissWeekly">
              <text class="weekly__close-tx">×</text>
            </view>
          </view>
        </view>

        <!-- Figma 3588:9354 — 分割线 -->
        <view v-if="showWeekly" class="divider" />

        <!-- Figma 3588:9355 — 档案管理 -->
        <view
          class="menu menu--files"
          :style="{ top: menuFilesTop }"
          @tap="goFiles"
        >
          <image
            class="menu__ico"
            src="/static/figma/my/ic_menu_files.png"
            mode="aspectFit"
          />
          <text class="menu__tx ff-yuan">档案管理</text>
          <view class="menu__arr" aria-hidden="true">
            <view class="menu__chev" />
          </view>
        </view>

        <!-- Figma 3588:9360 — 设置 -->
        <view
          class="menu menu--set"
          :style="{ top: menuSetTop }"
          @tap="goSettings"
        >
          <image
            class="menu__ico"
            src="/static/figma/my/ic_menu_settings.png"
            mode="aspectFit"
          />
          <text class="menu__tx ff-yuan">设置</text>
          <view class="menu__arr" aria-hidden="true">
            <view class="menu__chev" />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- Figma 3588:9353 — 底栏 335×65 @ 20,721 -->
    <view class="tabbar">
      <view class="tabbar__bg" />
      <view class="tabbar__it tabbar__it--match" @tap="goTab('matching')">
        <image
          class="tabbar__ico tabbar__ico--match"
          src="/static/figma/my/tb_match.png"
          mode="aspectFit"
        />
        <text class="tabbar__tx ff-yuan">匹配</text>
      </view>
      <view class="tabbar__it tabbar__it--msg" @tap="goTab('message')">
        <image
          class="tabbar__ico tabbar__ico--msg"
          src="/static/figma/my/tb_message.png"
          mode="aspectFit"
        />
        <text class="tabbar__tx ff-yuan">消息</text>
      </view>
      <view class="tabbar__it tabbar__it--my">
        <image
          class="tabbar__ico tabbar__ico--my"
          src="/static/figma/my/tb_my_active.png"
          mode="aspectFit"
        />
        <text class="tabbar__tx tabbar__tx--on ff-yuan">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/store/user'

const AVATAR_FALLBACK = '/static/figma/my/avatar_ellipse19.png'
const AVATAR_GRAY_PLACEHOLDER = '/static/images/avatar-mine-placeholder.png'

const userStore = useUserStore()
const { avatar, institutionName, organizationId, tags } = storeToRefs(userStore)

const showWeekly = ref(true)
const weeklyPeriodLabel = ref('最新：2026.4.-2026.4')

const tagsList = computed(() => (Array.isArray(tags.value) ? tags.value : []))
const tagsListLimited = computed(() => tagsList.value.slice(0, 2))

const avatarDisplay = computed(() => {
  const src =
    avatar.value && String(avatar.value).length > 0 ? avatar.value : AVATAR_FALLBACK
  if (
    src === AVATAR_GRAY_PLACEHOLDER ||
    src.endsWith('avatar-mine-placeholder.png') ||
    src.endsWith('default-avatar.png')
  ) {
    return AVATAR_FALLBACK
  }
  return src
})

const menuFilesTop = computed(() => (showWeekly.value ? '934rpx' : '682rpx'))
const menuSetTop = computed(() => (showWeekly.value ? '1058rpx' : '806rpx'))

const tabPaths = {
  matching: '/pages/matching/index',
  message: '/pages/message/index',
  my: '/pages/index/my'
}

onMounted(async () => {
  await userStore.init()
  await fetchWeeklyReport()
})

async function fetchWeeklyReport() {
  try {
    const res = await uniCloud.callFunction({
      name: 'weekly-report',
      data: { action: 'getLatest' }
    })
    const payload = res?.result?.data
    if (payload?.periodLabel) {
      weeklyPeriodLabel.value = `最新：${payload.periodLabel}`
    }
  } catch {
    /* 云函数未部署时使用 Figma 占位文案 */
  }
}

function dismissWeekly() {
  showWeekly.value = false
}

function goAccount() {
  uni.navigateTo({ url: '/pages/my/account' })
}

function goFiles() {
  uni.navigateTo({ url: '/pages/admin/files' })
}

function goSettings() {
  uni.navigateTo({ url: '/pages/my/settings' })
}

function goWeekly() {
  uni.navigateTo({ url: '/pages/message/weekly-report' })
}

function goTab(key) {
  if (key === 'my') return
  uni.reLaunch({ url: tabPaths[key] })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* Figma 3588:9333 — 375×812 基准，1px = 2rpx */
.page {
  min-height: 100vh;
  background: #f0e8fb;
  box-sizing: border-box;
}

.scroll {
  width: 750rpx;
  height: 100vh;
  box-sizing: border-box;
}

.canvas {
  position: relative;
  width: 750rpx;
  min-height: 1624rpx;
  padding-bottom: calc(130rpx + 28rpx + env(safe-area-inset-bottom));
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

/* 3588:9337 资料卡 */
.profile {
  position: absolute;
  left: 0;
  top: 0;
  width: 750rpx;
  height: 660rpx;
}

.profile__bg {
  position: absolute;
  left: 40rpx;
  top: 236rpx;
  width: 670rpx;
  height: 424rpx;
  z-index: 1;
}

.profile__avatar {
  position: absolute;
  left: 152rpx;
  top: 218rpx;
  width: 152rpx;
  height: 152rpx;
  border-radius: 76rpx;
  border: 4rpx solid #ffffff;
  box-sizing: border-box;
  z-index: 4;
}

.profile__edit {
  position: absolute;
  left: 558rpx;
  top: 288rpx;
  width: 104rpx;
  height: 44rpx;
  border-radius: 80rpx;
  border: 1.2rpx solid #ffffff;
  background: rgba(255, 255, 255, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
}

.profile__edit-tx {
  font-size: 22rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 1;
}

.profile__name {
  position: absolute;
  left: 168rpx;
  top: 406rpx;
  font-size: 40rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.2;
  max-width: 520rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 4;
}

.profile__id {
  position: absolute;
  left: 168rpx;
  top: 478rpx;
  font-size: 30rpx;
  font-weight: 400;
  color: #dec5ff;
  line-height: 1.2;
  z-index: 4;
}

.profile__tags {
  position: absolute;
  left: 168rpx;
  top: 532rpx;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  gap: 16rpx;
  z-index: 4;
}

.profile__pill {
  height: 56rpx;
  border-radius: 40rpx;
  background: rgba(249, 248, 250, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
  box-sizing: border-box;
}

.profile__pill-tx {
  font-size: 24rpx;
  font-weight: 500;
  color: #9245f9;
  line-height: 1;
  white-space: nowrap;
}

/* 3588:9365 周报推送 — 3588:9367 白底 + 3588:9366 配图 */
.weekly {
  position: absolute;
  left: 40rpx;
  top: 682rpx;
  width: 670rpx;
  height: 180rpx;
  z-index: 2;
}

.weekly__card {
  position: relative;
  width: 670rpx;
  height: 180rpx;
  border-radius: 32rpx;
  background: #ffffff;
  overflow: hidden;
}

.weekly__illus {
  position: absolute;
  left: 0;
  top: 0;
  width: 670rpx;
  height: 180rpx;
  z-index: 0;
}

.weekly__tit {
  position: absolute;
  left: 44rpx;
  top: 40rpx;
  font-size: 48rpx;
  font-weight: 400;
  color: #31233a;
  line-height: 1;
  z-index: 1;
}

.weekly__sub {
  position: absolute;
  left: 44rpx;
  top: 108rpx;
  font-size: 28rpx;
  font-weight: 400;
  color: #31233a;
  line-height: 1;
  z-index: 1;
}

.weekly__close {
  position: absolute;
  right: 12rpx;
  top: 16rpx;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.weekly__close-tx {
  font-size: 32rpx;
  font-weight: 300;
  color: #999999;
  line-height: 1;
}

.divider {
  position: absolute;
  left: 310rpx;
  top: 898rpx;
  width: 128rpx;
  height: 2rpx;
  background: #e8e8e8;
}

/* 3588:9355 / 3588:9360 菜单行 */
.menu {
  position: absolute;
  left: 40rpx;
  width: 670rpx;
  height: 100rpx;
  border-radius: 80rpx;
  background: #ffffff;
  z-index: 2;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0 36rpx;
  box-sizing: border-box;
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

.menu__arr {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.menu__chev {
  width: 14rpx;
  height: 14rpx;
  border-top: 3rpx solid #ddc7f9;
  border-right: 3rpx solid #ddc7f9;
  transform: rotate(45deg);
  box-sizing: border-box;
}

/* 3588:9353 底栏 */
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
