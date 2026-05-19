<template>
  <view class="page">
    <view class="search-bar">
      <input v-model="keyword" placeholder="搜索老人姓名" @input="onSearch" />
    </view>

    <view v-if="takerStore.loading" class="loading-wrap">
      <uni-load-more status="loading" />
    </view>

    <template v-else>
      <EmptyState v-if="takerStore.list.length === 0" message="暂无老人信息" />
      <scroll-view v-else scroll-y class="list-scroll">
        <TakerCard
          v-for="item in takerStore.list"
          :key="item._id"
          :taker="item"
          @tap="goDetail(item._id)"
        />
      </scroll-view>
    </template>

    <button class="fab" @tap="goForm">+ 新增</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTakerStore } from '@/store/taker'
import TakerCard from '@/components/taker/TakerCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const takerStore = useTakerStore()
const keyword = ref('')

onMounted(() => takerStore.fetchList())

function onSearch() {
  takerStore.fetchList({ keyword: keyword.value })
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/taker/detail?id=${id}` })
}

function goForm() {
  uni.navigateTo({ url: '/pages/taker/form' })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  padding: $page-padding-y $page-padding-x;
  background: $color-bg;
  min-height: 100vh;
}

.search-bar {
  margin-bottom: $spacing-md;

  input {
    background: $color-surface;
    border-radius: $radius-md;
    padding: $spacing-sm $spacing-md;
    font-size: $font-size-base;
  }
}

.list-scroll { height: calc(100vh - 200rpx); }

.fab {
  position: fixed;
  bottom: calc(40rpx + $bottom-safe-area);
  right: $page-padding-x;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-full;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  box-shadow: $shadow-md;
}
</style>
