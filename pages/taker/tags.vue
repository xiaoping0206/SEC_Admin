<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/taker-form/ic_back.svg"
            mode="aspectFit"
          />
        </view>
      </view>
    </view>

    <view class="shell" :style="{ paddingTop: navOuterPx + 'px' }">
      <view class="s2-head">
        <view class="s2-banner">
          <image
            class="s2-banner__ico"
            src="/static/figma/taker-form/banner_heart.png"
            mode="aspectFit"
          />
          <text class="s2-banner__ttl ff-yuan">选择你的标签！</text>
        </view>
        <text class="s2-sub ff-yuan">选择标签可以为你更精准的推荐用户。</text>
      </view>

      <view class="s2-picked">
        <scroll-view scroll-y class="s2-picked__scroll" :show-scrollbar="false">
          <view class="s2-picked__inner">
            <view
              v-for="(it, idx) in pickedTagItems"
              :key="'pk-' + idx"
              class="s2-picked__chip"
              @tap.stop="removeTag(it.key, it.code)"
            >
              <text class="s2-picked__tx ff-yuan">{{ it.label }}</text>
              <image
                class="s2-picked__close"
                src="/static/figma/taker-form/ic_tag_close.svg"
                mode="aspectFit"
              />
            </view>
          </view>
        </scroll-view>
      </view>

      <view class="s2-tabs-wrap">
        <view class="s2-tabs">
          <view
            v-for="g in envGroups"
            :key="'tab-' + g.key"
            class="s2-tabs__item"
            @tap="envTab = g.key"
          >
            <text
              class="s2-tabs__tx ff-yuan"
              :class="{ 's2-tabs__tx--on': envTab === g.key }"
            >
              {{ g.tabLabel }}
            </text>
            <view v-if="envTab === g.key" class="s2-tabs__line" />
          </view>
        </view>
        <view class="s2-tabs-divider" />
      </view>

      <scroll-view
        scroll-y
        class="s2-tags-scroll"
        :style="{ height: tagsScrollH + 'px' }"
        :show-scrollbar="false"
      >
        <view v-if="rulesStore.loading && !rulesStore.loaded" class="s2-tags-hint ff-yuan">
          正在加载标签...
        </view>
        <view v-else-if="rulesStore.loadError" class="s2-tags-hint ff-yuan">
          {{ rulesStore.loadError }}
        </view>
        <view v-else-if="!rulesStore.activeVersionId" class="s2-tags-hint ff-yuan">
          请先在管理端导入并激活匹配规则
        </view>
        <view v-else class="s2-tags">
          <view
            v-for="tag in currentEnvTags"
            :key="'tg-' + tag.code"
            class="s2-tag"
            :class="{ 's2-tag--on': tagOn(envTab, tag.code) }"
            @tap="toggleTag(envTab, tag)"
          >
            <text class="s2-tag__tx ff-yuan">{{ tag.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="foot">
      <view class="foot__fade" />
      <button class="foot__btn ff-yuan" @tap="onConfirm">确定</button>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useEnvTagForm } from '@/composables/use-env-tag-form.js'

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)
const tagsScrollH = ref(300)

const envTab = ref('hobby')
let openerChannel = null

const form = reactive({
  env_tags: {
    hobby: [],
    lifestyle: [],
    personality: [],
    comm_style: []
  }
})

const {
  rulesStore,
  envGroups,
  currentEnvTags,
  tagOn,
  toggleTag,
  pickedTagItems,
  removeTag,
  applyNormalizedEnvTags
} = useEnvTagForm(form.env_tags, envTab)

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
}

function layout() {
  layoutNav()
  const s = uni.getSystemInfoSync()
  const foot = uni.upx2px(180) + (s.safeAreaInsets?.bottom || 0)
  const fixedTop = navOuterPx.value + uni.upx2px(28 + 164 + 8 + 44 + 8 + 20 + 24 + 400 + 32 + 60 + 17)
  tagsScrollH.value = Math.max(120, s.windowHeight - fixedTop - foot)
}

onLoad(function () {
  openerChannel = this.getOpenerEventChannel()
  openerChannel.on('init', (data) => {
    if (data?.env_tags) applyNormalizedEnvTags(data.env_tags)
  })
})

onMounted(async () => {
  layout()
  await rulesStore.fetchActiveEnvTags()
  layout()
})

function goBack() {
  uni.navigateBack()
}

function onConfirm() {
  if (openerChannel) {
    openerChannel.emit('confirm', {
      hobby: [...(form.env_tags.hobby || [])],
      lifestyle: [...(form.env_tags.lifestyle || [])],
      personality: [...(form.env_tags.personality || [])],
      comm_style: [...(form.env_tags.comm_style || [])]
    })
  }
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

$match-purple: #9245f9;

.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #faf6ff 0%, #eadaff 100%);
  box-sizing: border-box;
}

.nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: #faf6ff;
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

.shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  box-sizing: border-box;
}

.s2-head {
  flex-shrink: 0;
  padding: 28rpx 44rpx 0;
  box-sizing: border-box;
}

.s2-banner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.s2-banner__ico {
  width: 164rpx;
  height: 164rpx;
  flex-shrink: 0;
}

.s2-banner__ttl {
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #31233a;
  line-height: normal;
}

.s2-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  font-weight: 400;
  color: #8d7a99;
  line-height: normal;
}

.s2-picked {
  flex-shrink: 0;
  margin: 24rpx 34rpx 0;
  height: 400rpx;
  padding: 24rpx;
  background: #ffffff;
  border-radius: 40rpx;
  box-sizing: border-box;
  overflow: hidden;
}

.s2-picked__scroll {
  width: 100%;
  height: 100%;
}

.s2-picked__inner {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
  align-content: flex-start;
}

.s2-picked__chip {
  height: 68rpx;
  padding: 0 28rpx;
  border-radius: 40rpx;
  background: #c091ff;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8rpx;
  box-sizing: border-box;
}

.s2-picked__tx {
  font-size: 26rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: normal;
  white-space: nowrap;
}

.s2-picked__close {
  width: 32rpx;
  height: 32rpx;
  flex-shrink: 0;
}

.s2-tabs-wrap {
  flex-shrink: 0;
}

.s2-tabs {
  display: flex;
  flex-direction: row;
  padding: 32rpx 34rpx 0;
  box-sizing: border-box;
}

.s2-tabs__item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.s2-tabs__tx {
  font-size: 28rpx;
  font-weight: 400;
  color: #8d7a99;
  line-height: normal;
  text-align: center;
}

.s2-tabs__tx--on {
  font-weight: 700;
  color: $match-purple;
}

.s2-tabs__line {
  margin-top: 8rpx;
  width: 48rpx;
  height: 6rpx;
  border-radius: 6rpx;
  background: $match-purple;
}

.s2-tabs-divider {
  height: 1rpx;
  margin: 16rpx 34rpx 0;
  background: rgba(146, 69, 249, 0.15);
}

.s2-tags-scroll {
  flex: 1;
  width: 100%;
  padding: 24rpx 34rpx 0;
  box-sizing: border-box;
}

.s2-tags-hint {
  padding: 24rpx 0;
  font-size: 28rpx;
  color: $color-text-secondary;
  text-align: center;
}

.s2-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.s2-tag {
  min-height: 68rpx;
  padding: 0 28rpx;
  border-radius: 40rpx;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.s2-tag--on {
  background: #eadaff;
  border: 2rpx solid $match-purple;
}

.s2-tag__tx {
  font-size: 26rpx;
  font-weight: 500;
  color: #31233a;
  line-height: normal;
}

.s2-tag--on .s2-tag__tx {
  color: $match-purple;
  font-weight: 700;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  padding: 0 30rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
  pointer-events: none;
}

.foot__fade {
  position: absolute;
  left: 0;
  right: 0;
  top: -80rpx;
  height: 80rpx;
  background: linear-gradient(
    180deg,
    rgba(240, 232, 251, 0) 0%,
    #f0e8fb 23.45%,
    #f0e8fb 100%
  );
  pointer-events: none;
}

.foot__btn {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 92rpx;
  line-height: 92rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(47deg, #c766ff 11.9%, #9245f9 94%);
  pointer-events: auto;
}

.foot__btn::after {
  border: none;
}
</style>
