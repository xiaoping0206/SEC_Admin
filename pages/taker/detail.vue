<template>
  <view class="page">
    <view class="nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="nav__back" @tap="goBack">
          <image
            class="nav__back-ico"
            src="/static/figma/matching/select/ic_back.svg"
            mode="aspectFit"
          />
        </view>
        <text class="nav__ttl ff-yuan">个人档案</text>
      </view>
    </view>

    <view v-if="loading" class="state" :style="{ paddingTop: navOuterPx + 'px' }">
      <text class="state__txt ff-yuan">加载中…</text>
    </view>

    <scroll-view
      v-else-if="detail"
      scroll-y
      class="scroll"
      :style="{ height: scrollH + 'px', paddingTop: navOuterPx + 'px' }"
      :show-scrollbar="false"
    >
      <view class="body">
        <view class="hero">
          <image class="hero__avatar" :src="avatarDisplay" mode="aspectFill" />
          <view class="hero__main">
            <text class="hero__name ff-yuan">{{ detail.name || '—' }}</text>
            <view class="hero__meta">
              <text class="hero__meta-tx ff-yuan">{{ genderText }}</text>
              <text class="hero__meta-tx ff-yuan">{{ birthCompact }}</text>
            </view>
          </view>
          <view class="hero__edit" @tap="goEdit">
            <text class="hero__edit-tx ff-yuan">编辑档案</text>
          </view>
        </view>

        <view class="traits">
          <view class="traits__col">
            <text class="traits__val ff-yuan">{{ wxText }}</text>
            <text class="traits__lab ff-yuan">五行</text>
          </view>
          <view class="traits__sep" />
          <view class="traits__col">
            <text class="traits__val ff-yuan">{{ constellationText }}</text>
            <text class="traits__lab ff-yuan">星座</text>
          </view>
          <view class="traits__sep" />
          <view class="traits__col">
            <text class="traits__val ff-yuan">{{ detail.mbti || '—' }}</text>
            <text class="traits__lab ff-yuan">MBTI</text>
          </view>
        </view>

        <view class="field-row">
          <text class="field-row__l ff-yuan">慢性病</text>
          <text class="field-row__v ff-yuan">{{ chronicLine }}</text>
        </view>

        <view class="tags-card">
          <text class="tags-card__ttl ff-yuan">标签</text>
          <view class="tags-card__wrap">
            <text v-if="flatTags.length === 0" class="tags-card__empty ff-yuan">暂无</text>
            <text v-for="(c, i) in flatTags" :key="'tg-' + i" class="tag ff-yuan">{{ c }}</text>
          </view>
        </view>

        <view class="field-row">
          <text class="field-row__l ff-yuan">护理等级</text>
          <text class="field-row__v ff-yuan">{{ careDisplay }}</text>
        </view>
        <view class="field-row">
          <text class="field-row__l ff-yuan">分配护工</text>
          <text class="field-row__v ff-yuan">{{ assigneeName }}</text>
        </view>
        <view class="field-row">
          <text class="field-row__l ff-yuan">状态</text>
          <text class="field-row__v ff-yuan">{{ statusZh }}</text>
        </view>
      </view>
    </scroll-view>

    <view v-else class="state" :style="{ paddingTop: navOuterPx + 'px' }">
      <text class="state__txt ff-yuan">未找到档案</text>
    </view>

    <view v-if="detail && showMatchBtn" class="foot">
      <view class="foot__fade" />
      <button class="foot__btn ff-yuan" @tap="goMatch">开始匹配</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { labelGender } from '@/utils/person-labels.js'
import { formatWuxing, normalizeBirthday } from '@/utils/format.js'
import { calcSixiangFromBirthday } from '@/utils/lunar.js'
import { toastCloudError } from '@/utils/cloud-error.js'
import { unwrapCloudObjectData } from '@/utils/cloud-result.js'
import { useRulesStore } from '@/store/rules.js'
import { envTagsToDisplayList } from '@/utils/env-tags.js'

const AVATAR_FALLBACK = '/static/figma/files/profile_avatar_sample.png'

const CARE_NAMES = ['—', '自理', '轻度', '中度', '重度', '特重']
const STATUS_MAP = { active: '有效', inactive: '停用', archived: '归档' }

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)

const id = ref('')
const loading = ref(true)
const detail = ref(null)
const scrollH = ref(500)
const giverRows = ref([])
const skipNextShowDetailFetch = ref(false)
const rulesStore = useRulesStore()

onLoad(async (opts) => {
  id.value = (opts && opts.id) || ''
  if (!id.value) {
    loading.value = false
    return
  }
  skipNextShowDetailFetch.value = true
  await load()
})

const genderText = computed(() => labelGender(detail.value?.gender))

const birthCompact = computed(() => {
  const b = normalizeBirthday(detail.value?.birthday)
  if (b?.solar) {
    const { year, month, day } = b.solar
    if (year != null && month != null && day != null) {
      return `${year}-${month}-${day}`
    }
  }
  if (typeof detail.value?.birthday === 'string') {
    const t = detail.value.birthday.trim()
    if (t) return t
  }
  return '—'
})

const constellationText = computed(() => {
  const d = detail.value
  if (!d) return '—'
  const s = d.constellation
  if (s != null && String(s).trim()) return String(s).trim()
  const b = normalizeBirthday(d.birthday)
  const mo = b?.solar?.month
  const dy = b?.solar?.day
  if (mo != null && dy != null) {
    const { constellation } = calcSixiangFromBirthday(mo, dy)
    return constellation || '—'
  }
  return '—'
})

const wxText = computed(() => formatWuxing(detail.value?.wuxing))

const avatarDisplay = computed(() => {
  const src = detail.value?.avatar || detail.value?.photo_url || detail.value?.avatar_url
  if (src && String(src).trim()) return String(src).trim()
  return AVATAR_FALLBACK
})

const chronicLine = computed(() => {
  const raw = detail.value?.chronic_disease
  if (Array.isArray(raw)) {
    const parts = raw.map((x) => String(x).trim()).filter(Boolean)
    return parts.length ? parts.join('、') : '无'
  }
  const s = String(raw || '').trim()
  if (!s) return '无'
  return s.split(/[,，]/).map((x) => x.trim()).filter(Boolean).join('、') || '无'
})

const flatTags = computed(() =>
  envTagsToDisplayList(detail.value?.env_tags, rulesStore.envTagGroups)
)

const careDisplay = computed(() => {
  const c = detail.value?.care_level
  if (typeof c !== 'number' || Number.isNaN(c)) return '—'
  const n = Math.round(c)
  return n >= 1 && n <= 5 ? CARE_NAMES[n] : '—'
})

const assigneeName = computed(() => {
  const t = detail.value
  if (!t) return '未匹配'
  const n = String(t.matched_giver_name || '').trim()
  if (n) return n
  const gid = t.assigned_giver_id || t.matched_giver_id || t.linked_giver_id
  if (!gid) return '未匹配'
  const g = giverRows.value.find((x) => x._id === gid)
  return g?.name?.trim() || '—'
})

const statusZh = computed(() => {
  const s = detail.value?.status
  if (s && s !== 'active' && STATUS_MAP[s]) return STATUS_MAP[s]
  return detail.value?.is_matched ? '有效' : '待匹配'
})

const showMatchBtn = computed(() => {
  const t = detail.value
  if (!t) return false
  const st = t.status ?? 'active'
  if (st !== 'active') return false
  return !t.is_matched
})

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
}

function layout() {
  layoutNav()
  const s = uni.getSystemInfoSync()
  const foot = showMatchBtn.value ? uni.upx2px(180) + (s.safeAreaInsets?.bottom || 0) : 0
  scrollH.value = Math.max(200, s.windowHeight - foot)
}

async function loadGivers() {
  try {
    const gm = uniCloud.importObject('giver-manager')
    const gr = await gm.getGiverList({ page: 1, pageSize: 500 })
    const unpacked = unwrapCloudObjectData(gr)
    const raw = Array.isArray(unpacked) ? unpacked : Array.isArray(gr?.data) ? gr.data : []
    giverRows.value = raw.filter((x) => x && !x.is_deleted)
  } catch {
    giverRows.value = []
  }
}

async function load() {
  if (!id.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    await rulesStore.fetchActiveEnvTags()
    await loadGivers()
    const tm = uniCloud.importObject('taker-manager')
    const res = await tm.getTakerDetail({ id: id.value })
    detail.value = unwrapCloudObjectData(res)
  } catch (e) {
    toastCloudError(e)
    detail.value = null
  } finally {
    loading.value = false
    layout()
  }
}

onShow(async () => {
  layout()
  if (skipNextShowDetailFetch.value) {
    skipNextShowDetailFetch.value = false
    return
  }
  if (id.value) await load()
})

function goBack() {
  uni.navigateBack()
}

function goEdit() {
  if (!id.value) return
  uni.navigateTo({ url: `/pages/taker/edit?id=${id.value}` })
}

function goMatch() {
  if (!id.value) return
  uni.navigateTo({ url: `/pages/matching/index?takerId=${id.value}` })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

/* Figma 3588:8703 — 375×812，1px = 2rpx */
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

.nav__ttl {
  font-size: 34rpx;
  font-weight: 600;
  color: rgba(49, 35, 58, 0.9);
}

.scroll {
  width: 100%;
  box-sizing: border-box;
}

.body {
  padding: 24rpx 40rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.hero {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.hero__avatar {
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: #e8dff5;
}

.hero__main {
  flex: 1;
  min-width: 0;
  padding-top: 8rpx;
}

.hero__name {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #31233a;
  line-height: 1.3;
  margin-bottom: 12rpx;
}

.hero__meta {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
}

.hero__meta-tx {
  font-size: 32rpx;
  font-weight: 600;
  color: #6c5c76;
}

.hero__edit {
  flex-shrink: 0;
  margin-top: 16rpx;
  height: 72rpx;
  padding: 0 28rpx;
  border-radius: 100rpx;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.hero__edit-tx {
  font-size: 26rpx;
  font-weight: 500;
  color: #31233a;
}

.traits {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 160rpx;
  margin-bottom: 24rpx;
  border-radius: 32rpx;
  background: #f0dbff;
  overflow: hidden;
}

.traits__col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 16rpx 8rpx;
  box-sizing: border-box;
}

.traits__val {
  font-size: 40rpx;
  font-weight: 700;
  color: #9245f9;
  line-height: 1.2;
}

.traits__lab {
  font-size: 20rpx;
  font-weight: 500;
  color: #6c5c76;
}

.traits__sep {
  width: 1rpx;
  margin: 24rpx 0;
  background: rgba(146, 69, 249, 0.2);
  flex-shrink: 0;
}

.field-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  min-height: 84rpx;
  padding: 0 36rpx;
  margin-bottom: 16rpx;
  border-radius: 100rpx;
  background: rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}

.field-row__l {
  flex-shrink: 0;
  font-size: 24rpx;
  font-weight: 600;
  color: #6c5c76;
}

.field-row__v {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  font-weight: 600;
  color: #31233a;
  text-align: right;
  word-break: break-all;
}

.tags-card {
  margin-bottom: 16rpx;
  padding: 28rpx 36rpx 32rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.8);
  box-sizing: border-box;
}

.tags-card__ttl {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #6c5c76;
  margin-bottom: 20rpx;
}

.tags-card__wrap {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tags-card__empty {
  font-size: 24rpx;
  color: #8d7a99;
}

.tag {
  padding: 10rpx 28rpx;
  border-radius: 40rpx;
  background: #eadaff;
  font-size: 24rpx;
  font-weight: 500;
  color: #590092;
  line-height: 1.3;
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.state__txt {
  font-size: 28rpx;
  color: #8d7a99;
}

.foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  padding: 0 60rpx calc(48rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
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
  height: 96rpx;
  line-height: 96rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(47deg, #c766ff 11.9%, #9245f9 94%);
}

.foot__btn::after {
  border: none;
}
</style>
