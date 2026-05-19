<template>
  <view class="page">
    <view v-if="running" class="running-state">
      <uni-load-more status="loading" />
      <text class="hint">正在计算匹配度，请稍候…</text>
    </view>

    <template v-else-if="results.length">
      <view class="result-header">
        <text class="title">匹配结果（共 {{ results.length }} 位）</text>
      </view>
      <scroll-view scroll-y class="result-list">
        <view
          v-for="r in results"
          :key="r.giver_id"
          class="result-item"
          @tap="goResult(r)"
        >
          <text class="giver-name">{{ r.giver_name }}</text>
          <view class="score-row">
            <MatchTag :grade="r.match_grade" />
            <text class="score">{{ r.total_score }}分</text>
          </view>
          <CareScoreBar :scores="r.scores" />
        </view>
      </scroll-view>
    </template>

    <EmptyState v-else message="暂无可匹配护理员" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMatchingStore } from '@/store/matching'
import CareScoreBar from '@/components/common/CareScoreBar.vue'
import MatchTag from '@/components/common/MatchTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const matchingStore = useMatchingStore()
const running = ref(true)
const results = ref([])
const takerId = ref('')

onMounted(async () => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1]
  takerId.value = page.options.id
  results.value = await matchingStore.run(takerId.value)
  running.value = false
})

function goResult(r) {
  uni.navigateTo({ url: `/pages/matching/result?takerId=${takerId.value}&giverId=${r.giver_id}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  padding: $page-padding-y $page-padding-x;
  background: $color-bg;
  min-height: 100vh;
}

.running-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: $spacing-2xl;

  .hint {
    margin-top: $spacing-md;
    color: $color-text-secondary;
    font-size: $font-size-sm;
  }
}

.result-header {
  margin-bottom: $spacing-md;

  .title { font-size: $font-size-md; font-weight: $font-weight-bold; color: $color-text-primary; }
}

.result-list { height: calc(100vh - 200rpx); }

.result-item {
  background: $color-surface;
  border-radius: $radius-lg;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  box-shadow: $shadow-sm;
}

.giver-name {
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $color-text-primary;
  margin-bottom: $spacing-sm;
  display: block;
}

.score-row {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-bottom: $spacing-sm;

  .score { font-size: $font-size-lg; font-weight: $font-weight-bold; color: $color-primary; }
}
</style>
