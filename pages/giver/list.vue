<template>
  <view class="page">
    <view class="search-bar">
      <input v-model="keyword" placeholder="搜索护理员姓名" @input="onSearch" />
    </view>

    <view v-if="giverStore.loading" class="loading-wrap">
      <uni-load-more status="loading" />
    </view>

    <template v-else>
      <EmptyState v-if="giverStore.list.length === 0" message="暂无护理员信息" />
      <scroll-view v-else scroll-y class="list-scroll">
        <GiverCard
          v-for="item in giverStore.list"
          :key="item._id"
          :giver="item"
          @tap="goDetail(item._id)"
        />
      </scroll-view>
    </template>

    <button class="fab" @tap="goForm">+ 新增</button>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGiverStore } from '@/store/giver'
import GiverCard from '@/components/giver/GiverCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const giverStore = useGiverStore()
const keyword = ref('')

onMounted(() => giverStore.fetchList())

function onSearch() {
  giverStore.fetchList({ keyword: keyword.value })
}

function goDetail(id) {
  uni.navigateTo({ url: `/pages/giver/detail?id=${id}` })
}

function goForm() {
  uni.navigateTo({ url: '/pages/giver/form' })
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
  background: $color-secondary;
  color: #fff;
  border-radius: $radius-full;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  box-shadow: $shadow-md;
}
</style>
