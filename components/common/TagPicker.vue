<template>
  <view v-if="visible">
    <view
      style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100"
      @tap="emit('close')"
    />
    <view
      style="position:fixed;bottom:0;left:0;width:100%;max-height:88vh;background:#fff;border-radius:32rpx 32rpx 0 0;z-index:101;padding-bottom:env(safe-area-inset-bottom)"
      @tap.stop
    >
      <view class="hdr">
        <text class="hdr__tit">选择标签</text>
        <text class="hdr__close" @tap="emit('close')">关闭</text>
      </view>

      <scroll-view scroll-y class="pane">
        <view class="picked">
          <text class="muted"
            >各类最多选 5 项；可不选。<text style="margin-left:8rpx">{{ pickedCount }}/不限</text></text>
        </view>

        <view class="tabs">
          <text
            v-for="g in envGroups"
            :key="'tab-' + g.key"
            class="tabs__t"
            :class="{ 'tabs__t--on': envTab === g.key }"
            @tap="envTab = g.key"
          >
            {{ g.tabLabel }}({{ draft[g.key]?.length || 0 }})
          </text>
        </view>

        <view class="tag-grid">
          <view
            v-for="tag in currentTags"
            :key="'tg-' + tag"
            class="tag-cell"
            :class="{ 'tag-cell--on': tagOn(tag) }"
            @tap="toggleTag(tag)"
          >
            <text class="tag-cell__txt">{{ tag }}</text>
          </view>
        </view>
      </scroll-view>

      <view class="foot">
        <view class="foot__ok" @tap="onConfirm">
          <text class="foot__txt">确定</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ENV_TAG_GROUPS } from '@/utils/archive-wizard-tags.js'

const props = defineProps({
  visible: { type: Boolean, default: false },
  value: {
    type: Object,
    default: () => ({
      hobby: [],
      lifestyle: [],
      personality: [],
      comm_style: []
    })
  }
})

const emit = defineEmits(['close', 'confirm'])

const envGroups = ENV_TAG_GROUPS
const envTab = ref('hobby')

const draft = reactive({
  hobby: [],
  lifestyle: [],
  personality: [],
  comm_style: []
})

watch(
  () => props.visible,
  (v) => {
    if (v) {
      const m = props.value && typeof props.value === 'object' ? props.value : {}
      draft.hobby = [...(m.hobby || [])]
      draft.lifestyle = [...(m.lifestyle || [])]
      draft.personality = [...(m.personality || [])]
      draft.comm_style = [...(m.comm_style || [])]
    }
  }
)

const pickedCount = computed(() => {
  let n = 0
  envGroups.forEach((g) => {
    n += (draft[g.key] || []).length
  })
  return n
})

const currentTags = computed(() => {
  const g = envGroups.find((x) => x.key === envTab.value)
  return g ? g.tags : []
})

function getCatName(cat) {
  const m = {
    hobby: '兴趣爱好',
    lifestyle: '生活方式',
    personality: '性格特征',
    comm_style: '沟通偏好'
  }
  return m[cat] || cat
}

function toggleTag(item) {
  const key = envTab.value
  const arr = draft[key]
  const idx = arr.indexOf(item)
  if (idx !== -1) {
    arr.splice(idx, 1)
    return
  }
  if (arr.length >= 5) {
    uni.showToast({ title: `${getCatName(key)}最多选5个`, icon: 'none' })
    return
  }
  arr.push(item)
}

function tagOn(tag) {
  return (draft[envTab.value] || []).includes(tag)
}

function onConfirm() {
  const out = {
    hobby: [...draft.hobby],
    lifestyle: [...draft.lifestyle],
    personality: [...draft.personality],
    comm_style: [...draft.comm_style]
  }
  emit('confirm', out)
  emit('close')
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.hdr {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 40rpx;
  border-bottom: 1rpx solid #eee;
}

.hdr__tit {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.hdr__close {
  font-size: 28rpx;
  color: #999;
}

.pane {
  max-height: 62vh;
  padding: 16rpx 24rpx 24rpx;
  box-sizing: border-box;
}

.picked {
  margin-bottom: 12rpx;
}

.muted {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.tabs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
  gap: 8rpx;
}

.tabs__t {
  font-size: 22rpx;
  color: $color-text-secondary;
  padding-bottom: 8rpx;
  border-bottom: 4rpx solid transparent;
}

.tabs__t--on {
  color: #4a90e2;
  border-bottom-color: #4a90e2;
}

.tag-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-cell {
  padding: 12rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid $color-border;
  background: #fff;
}

.tag-cell--on {
  border-color: #4a90e2;
  background: rgba(74, 144, 226, 0.12);
}

.tag-cell__txt {
  font-size: 22rpx;
  color: $color-text-primary;
}

.tag-cell--on .tag-cell__txt {
  color: #4a90e2;
}

.foot {
  padding: 24rpx 40rpx;
  border-top: 1rpx solid #eee;
}

.foot__ok {
  background: #4a90e2;
  border-radius: 16rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.foot__txt {
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
