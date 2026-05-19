<template>
  <view class="page">
    <view class="progress">
      <view class="progress__inner" :style="{ width: progressPct }" />
    </view>

    <scroll-view scroll-y class="scroll" :style="{ height: scrollHpx + 'px' }">
      <block v-if="step === 1">
        <view class="banner">
          <view class="avatar-ph" />
          <text class="h1">填写你的资料!</text>
        </view>

        <text class="label">*姓名</text>
        <input
          class="input"
          type="text"
          :value="form.name"
          maxlength="20"
          placeholder="你的名字"
          placeholder-class="input-ph"
          @input="form.name = $event.detail.value"
        />

        <text class="label">*性别</text>
        <view class="gender">
          <view
            class="gender__chip"
            :class="{ 'gender__chip--on': form.gender === 'female' }"
            @tap="form.gender = 'female'"
          >
            <text class="gender__txt">女</text>
          </view>
          <view
            class="gender__chip"
            :class="{ 'gender__chip--on': form.gender === 'male' }"
            @tap="form.gender = 'male'"
          >
            <text class="gender__txt">男</text>
          </view>
        </view>

        <text class="label">*设置生日</text>
        <view class="input input--hit" @tap="showBirth = true">
          <text :class="birthHintClass">{{ birthDisplay }}</text>
        </view>
        <view v-if="form.wuxing" class="derived-wsx">
          <text>
            自动计算：五行「{{ wuxingLabel(form.wuxing) }}」 · 四象「{{ sixiangLabel(form.sixiang) }}」
          </text>
        </view>

        <text class="label">*工龄（年）</text>
        <view class="input input--hit" @tap="openExpPanel">
          <text :class="expFieldClass">{{ experienceFieldText }}</text>
        </view>

        <text class="label">*护理等级</text>
        <picker
          mode="selector"
          :range="careLevelRange"
          :value="careLevelPickerValue"
          @change="onCareLevelPick"
        >
          <view class="input input--hit">
            <text :class="careFieldClass">{{ careLevelDisplay }}</text>
          </view>
        </picker>
      </block>

      <block v-else-if="step === 2">
        <view class="head2">
          <text class="h1">选择你的标签!</text>
          <text class="sub">每类最多选5个标签；可不选，下一步直接进入。</text>
          <text class="skip" @tap="skipTags">跳过</text>
        </view>

        <view class="picked">
          <view v-for="(it, idx) in pickedTagItems" :key="'pk-' + idx" class="pick-chip">
            <text class="pick-chip__t">{{ it.label }}</text>
            <text class="pick-chip__x" @tap.stop="removeTag(it.key, it.label)">×</text>
          </view>
          <text v-if="pickedTagItems.length === 0" class="muted">还未选择标签</text>
        </view>

        <view class="env-tabs">
          <text
            class="env-tabs__t"
            :class="{ 'env-tabs__t--on': envTab === 'hobby' }"
            @tap="envTab = 'hobby'"
          >
            兴趣爱好({{ form.env_tags.hobby.length }})
          </text>
          <text
            class="env-tabs__t"
            :class="{ 'env-tabs__t--on': envTab === 'lifestyle' }"
            @tap="envTab = 'lifestyle'"
          >
            生活方式({{ form.env_tags.lifestyle.length }})
          </text>
          <text
            class="env-tabs__t"
            :class="{ 'env-tabs__t--on': envTab === 'personality' }"
            @tap="envTab = 'personality'"
          >
            性格特征({{ form.env_tags.personality.length }})
          </text>
          <text
            class="env-tabs__t"
            :class="{ 'env-tabs__t--on': envTab === 'comm_style' }"
            @tap="envTab = 'comm_style'"
          >
            沟通偏好({{ form.env_tags.comm_style.length }})
          </text>
        </view>

        <view class="tag-grid">
          <view
            v-for="tag in currentEnvTags"
            :key="'tg-' + tag"
            class="tag-cell"
            :class="{ 'tag-cell--on': tagOn(envTab, tag) }"
            @tap="toggleTag(envTab, tag)"
          >
            <text class="tag-cell__txt">{{ tag }}</text>
          </view>
        </view>
      </block>

      <block v-else>
        <view class="head2 head2--mbti">
          <text class="h1">选择你的MBTI !!</text>
          <text class="skip" @tap="finishSkipMbti">跳过</text>
        </view>

        <view class="mbti-hdr">
          <text class="mbti-hdr__c">外向</text>
          <text class="mbti-hdr__c">实感</text>
          <text class="mbti-hdr__c">理智</text>
          <text class="mbti-hdr__c">判断</text>
        </view>
        <view class="mbti-row">
          <view
            v-for="(pair, col) in mbtiPairs"
            :key="'r1-' + col"
            class="mbti-cell"
            :class="{ 'mbti-cell--on': mbtiPick[col] === pair[0] }"
            @tap="setMbti(col, pair[0])"
          >
            <text class="mbti-cell__l">{{ pair[0] }}</text>
          </view>
        </view>
        <view class="mbti-hdr mbti-hdr--low">
          <text class="mbti-hdr__c">内向</text>
          <text class="mbti-hdr__c">直觉</text>
          <text class="mbti-hdr__c">情感</text>
          <text class="mbti-hdr__c">感知</text>
        </view>
        <view class="mbti-row">
          <view
            v-for="(pair, col) in mbtiPairs"
            :key="'r2-' + col"
            class="mbti-cell"
            :class="{ 'mbti-cell--on': mbtiPick[col] === pair[1] }"
            @tap="setMbti(col, pair[1])"
          >
            <text class="mbti-cell__l">{{ pair[1] }}</text>
          </view>
        </view>

        <text class="mbti-sum">当前：{{ mbtiResult || '未选择' }}</text>
      </block>
    </scroll-view>

    <view class="footer">
      <button v-if="step === 1" class="cta" @tap="next1">下一步</button>
      <template v-else-if="step === 2">
        <button class="cta" @tap="goToStep3">下一步</button>
        <text class="footer__link" @tap="deferTags">暂不设置</text>
      </template>
      <template v-else>
        <button class="cta" @tap="finishComplete">完成</button>
        <text class="footer__link" @tap="finishDeferMbti">暂不设置</text>
      </template>
    </view>

    <BirthdayPicker
      :visible="showBirth"
      wizard-kind="giver"
      :value="form.birthday"
      @close="showBirth = false"
      @confirm="onBirthConfirm"
    />

    <view v-if="showExpPanel">
      <view
        style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100"
        @tap="onExpMaskTap"
      />
      <view
        style="position:fixed;bottom:0;left:0;width:100%;background:#fff;border-radius:32rpx 32rpx 0 0;z-index:101;padding-bottom:env(safe-area-inset-bottom)"
        @tap.stop
      >
        <view
          style="display:flex;justify-content:space-between;align-items:center;padding:32rpx 40rpx;border-bottom:1rpx solid #eee"
        >
          <text style="font-size:36rpx;font-weight:600">工龄（年）</text>
          <text style="font-size:28rpx;color:#999" @tap="onExpClose">关闭</text>
        </view>
        <picker-view
          :value="experienceIndex"
          style="height:400rpx"
          indicator-style="height:80rpx"
          @change="onExpPickChange"
        >
          <picker-view-column>
            <view
              v-for="item in experienceOptions"
              :key="item"
              style="display:flex;align-items:center;justify-content:center;height:80rpx;font-size:32rpx"
            >
              {{ item }}
            </view>
          </picker-view-column>
        </picker-view>
        <view style="padding:24rpx 40rpx">
          <view
            style="background:#4a90e2;border-radius:16rpx;height:88rpx;display:flex;align-items:center;justify-content:center"
            @tap="confirmExperience"
          >
            <text style="color:#fff;font-size:32rpx;font-weight:600">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BirthdayPicker from '@/components/common/BirthdayPicker.vue'
import {
  calcWuxingFromBirthday,
  calcSixiangFromBirthday
} from '@/utils/lunar.js'
import { ENV_TAG_GROUPS } from '@/utils/archive-wizard-tags.js'
import { parseCloudError } from '@/utils/cloud-error.js'
import { formatWuxing as wuxingLabel, sixiangLabel } from '@/utils/format.js'

const editId = ref('')
const step = ref(1)
const showBirth = ref(false)
const scrollHpx = ref(500)
const envTab = ref('hobby')
const envGroups = ENV_TAG_GROUPS

const showExpPanel = ref(false)
const experienceOptions = Array.from({ length: 51 }, (_, i) => `${i}年`)
const experienceIndex = ref([0])

const form = reactive({
  name: '',
  gender: '',
  birthday: null,
  wuxing: '',
  sixiang: '',
  experience_years: null,
  care_level: null,
  env_tags: {
    hobby: [],
    lifestyle: [],
    personality: [],
    comm_style: []
  },
  mbti: ''
})

const careLevelRange = ['请选择', '1 自理', '2 轻度', '3 中度', '4 重度', '5 特重']

const careLevelDisplay = computed(() => {
  const c = form.care_level
  if (typeof c !== 'number' || c < 1 || c > 5) return '请选择'
  return careLevelRange[c]
})

const careFieldClass = computed(() =>
  typeof form.care_level === 'number' && form.care_level >= 1 && form.care_level <= 5
    ? 'bd-t'
    : 'bd-t bd-t--ph'
)

const careLevelPickerValue = computed(() => {
  const c = form.care_level
  if (typeof c !== 'number' || c < 1 || c > 5) return 0
  return c
})

function syncWuxingSixiangFromBirthday() {
  if (!form.birthday || !form.birthday.solar) {
    form.wuxing = ''
    form.sixiang = ''
    return
  }
  const { year, month, day } = form.birthday.solar
  form.wuxing = calcWuxingFromBirthday(year, month, day).wuxing
  form.sixiang = calcSixiangFromBirthday(month, day).sixiang
}

function onCareLevelPick(e) {
  const i = Number(e.detail.value)
  form.care_level = i === 0 ? null : i
}

const mbtiPairs = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P']
]
const mbtiPick = ref(['', '', '', ''])

const progressPct = computed(() => {
  if (step.value === 1) return '33.33%'
  if (step.value === 2) return '66.66%'
  return '100%'
})

const birthDisplay = computed(() => {
  const b = form.birthday
  if (!b || !b.solar) return '点击选择生日'
  const sy = b.solar
  const mo = `${sy.month}`.padStart(2, '0')
  const d = `${sy.day}`.padStart(2, '0')
  const kind = b.type === 'lunar' ? '农历' : '阳历'
  return `${sy.year}年${mo}月${d}日（${kind}）`
})

const birthHintClass = computed(() =>
  form.birthday && form.birthday.solar ? 'bd-t' : 'bd-t bd-t--ph'
)

const experienceFieldText = computed(() =>
  form.experience_years === null || form.experience_years === undefined
    ? '请选择'
    : `${form.experience_years}年`
)

const expFieldClass = computed(() =>
  form.experience_years === null || form.experience_years === undefined ? 'bd-t bd-t--ph' : 'bd-t'
)

function onExpMaskTap() {
  showExpPanel.value = false
}

function onExpClose() {
  showExpPanel.value = false
}

function openExpPanel() {
  const y = form.experience_years
  const idx =
    typeof y === 'number' && !Number.isNaN(y) ? Math.min(50, Math.max(0, y)) : 0
  experienceIndex.value = [idx]
  showExpPanel.value = true
}

function onExpPickChange(e) {
  experienceIndex.value = e.detail.value
}

function confirmExperience() {
  form.experience_years = experienceIndex.value[0]
  showExpPanel.value = false
}

function tagOn(key, label) {
  return (form.env_tags[key] || []).includes(label)
}

function getCategoryName(cat) {
  const map = {
    hobby: '兴趣爱好',
    lifestyle: '生活方式',
    personality: '性格特征',
    comm_style: '沟通偏好'
  }
  return map[cat] || cat
}

function toggleTag(category, item) {
  const arr = form.env_tags[category]
  const idx = arr.indexOf(item)
  if (idx !== -1) {
    arr.splice(idx, 1)
    return
  }
  if (arr.length >= 5) {
    uni.showToast({
      title: `${getCategoryName(category)}最多选5个`,
      icon: 'none'
    })
    return
  }
  arr.push(item)
}

const currentEnvTags = computed(() => {
  const g = envGroups.find((x) => x.key === envTab.value)
  return g ? g.tags : []
})

const pickedTagItems = computed(() => {
  const out = []
  envGroups.forEach((g) => {
    ;(form.env_tags[g.key] || []).forEach((label) =>
      out.push({ key: g.key, label })
    )
  })
  return out
})

function unwrapCloud(ret) {
  if (ret && typeof ret === 'object' && ret.result !== undefined) return ret.result
  return ret
}

onLoad((opts) => {
  editId.value = (opts && opts.id) || ''
})

function layout() {
  const s = uni.getSystemInfoSync()
  scrollHpx.value = Math.max(200, s.windowHeight - uni.upx2px(232))
}

async function hydrate() {
  if (!editId.value) return
  try {
    const gm = uniCloud.importObject('giver-manager')
    const res = await gm.getGiverDetail({ id: editId.value })
    const d = res?.data ?? res?.result?.data
    if (!d) return
    form.name = d.name || ''
    form.gender = d.gender || ''
    form.birthday = d.birthday || null
    form.mbti = d.mbti || ''
    form.experience_years =
      typeof d.experience_years === 'number' && !Number.isNaN(d.experience_years)
        ? Math.max(0, Math.min(50, d.experience_years))
        : null
    if (d.env_tags && typeof d.env_tags === 'object') {
      form.env_tags.hobby = [...(d.env_tags.hobby || [])]
      form.env_tags.lifestyle = [...(d.env_tags.lifestyle || [])]
      form.env_tags.personality = [...(d.env_tags.personality || [])]
      form.env_tags.comm_style = [...(d.env_tags.comm_style || [])]
    }
    if (form.mbti && form.mbti.length === 4) {
      mbtiPick.value = form.mbti.split('')
    }
    if (typeof d.care_level === 'number' && !Number.isNaN(d.care_level)) {
      const lv = Math.round(d.care_level)
      form.care_level = lv >= 1 && lv <= 5 ? lv : null
    } else {
      form.care_level = null
    }
    syncWuxingSixiangFromBirthday()
  } catch (e) {
    uni.showToast({ title: parseCloudError(e), icon: 'none' })
  }
}

onMounted(async () => {
  layout()
  await hydrate()
})

function onBirthConfirm(payload) {
  form.birthday = payload
  showBirth.value = false
  syncWuxingSixiangFromBirthday()
}

function next1() {
  const name = String(form.name || '').trim()
  if (!name) {
    uni.showToast({ title: '请填写姓名', icon: 'none' })
    return
  }
  if (!form.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }
  if (!form.birthday || !form.birthday.solar) {
    uni.showToast({ title: '请设置生日', icon: 'none' })
    return
  }
  if (form.experience_years === null || form.experience_years === undefined) {
    uni.showToast({ title: '请选择工龄', icon: 'none' })
    return
  }
  if (form.care_level == null) {
    uni.showToast({ title: '请选择护理等级', icon: 'none' })
    return
  }
  step.value = 2
}

function skipTags() {
  step.value = 3
}

function deferTags() {
  step.value = 3
}

function goToStep3() {
  step.value = 3
}

function setMbti(col, letter) {
  const cur = mbtiPick.value[col]
  const next = [...mbtiPick.value]
  next[col] = cur === letter ? '' : letter
  mbtiPick.value = next
}

const mbtiResult = computed(() => {
  const p = mbtiPick.value
  if (p.every((x) => x && x.length === 1)) return p.join('')
  return ''
})

function finishSkipMbti() {
  saveProfile('')
}

function finishDeferMbti() {
  saveProfile('')
}

function finishComplete() {
  const s = mbtiResult.value
  if (s.length !== 4) {
    uni.showToast({ title: '请完成四列选择', icon: 'none' })
    return
  }
  saveProfile(s)
}

async function saveProfile(mbtiStr) {
  if (!form.birthday || !form.birthday.solar) {
    uni.showToast({ title: '缺少生日', icon: 'none' })
    return
  }
  if (form.care_level == null) {
    uni.showToast({ title: '缺少护理等级', icon: 'none' })
    return
  }
  const { year, month, day } = form.birthday.solar
  const { wuxing } = calcWuxingFromBirthday(year, month, day)
  const { sixiang, constellation } = calcSixiangFromBirthday(month, day)
  const age = new Date().getFullYear() - year

  const payload = {
    name: String(form.name || '').trim(),
    gender: form.gender,
    birthday: form.birthday,
    age,
    experience_years: form.experience_years ?? 0,
    care_level: form.care_level,
    wuxing,
    sixiang,
    constellation,
    mbti: mbtiStr || ''
  }

  payload.env_tags = {
    hobby: [...(form.env_tags.hobby || [])],
    lifestyle: [...(form.env_tags.lifestyle || [])],
    personality: [...(form.env_tags.personality || [])],
    comm_style: [...(form.env_tags.comm_style || [])]
  }

  uni.showLoading({ title: '保存中...', mask: true })
  try {
    const gm = uniCloud.importObject('giver-manager')
    let saved = editId.value
    if (editId.value) {
      await gm.updateGiver({ id: editId.value, ...payload })
    } else {
      const raw = await gm.addGiver(payload)
      const out = unwrapCloud(raw)
      saved = out?.data?.id || out?.id
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    const id = saved || editId.value
    setTimeout(() => {
      uni.redirectTo({ url: `/pages/giver/detail?id=${id}` })
    }, 600)
  } catch (e) {
    uni.showToast({ title: parseCloudError(e), icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.progress {
  height: 8rpx;
  background: #e8e8e8;
}

.progress__inner {
  height: 100%;
  background: #4a90e2;
}

.scroll {
  width: 100%;
  padding: 24rpx $page-padding-x 24rpx;
  box-sizing: border-box;
}

.banner {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 32rpx;
}

.avatar-ph {
  width: 82rpx;
  height: 82rpx;
  border-radius: 16rpx;
  background: #e0e0e0;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.h1 {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text-primary;
}

.label {
  display: block;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin: 16rpx 0 8rpx;
}

.input {
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #ffffff;
  border: 1rpx solid $color-border;
  font-size: $font-size-base;
  color: $color-text-primary;
  box-sizing: border-box;
}

.input-ph {
  color: $color-text-secondary;
}

.input--hit {
  display: flex;
  align-items: center;
}

.bd-t {
  font-size: $font-size-base;
  color: $color-text-primary;
}

.bd-t--ph {
  color: $color-text-secondary;
}

.derived-wsx {
  margin-top: 8rpx;
  color: #999;
  font-size: 24rpx;
  line-height: 1.45;
}

.gender {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.gender__chip {
  flex: 1;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12rpx;
  border: 1rpx solid $color-border;
  background: #ffffff;
}

.gender__chip--on {
  background: #4a90e2;
  border-color: #4a90e2;
}

.gender__txt {
  font-size: $font-size-base;
  color: $color-text-primary;
}

.gender__chip--on .gender__txt {
  color: #ffffff;
}

.head2 {
  position: relative;
  margin-bottom: 16rpx;
}

.head2--mbti {
  padding-right: 80rpx;
}

.sub {
  display: block;
  font-size: $font-size-sm;
  color: $color-text-secondary;
  margin-top: 8rpx;
}

.skip {
  position: absolute;
  right: 0;
  top: 0;
  font-size: $font-size-sm;
  color: #4a90e2;
}

.picked {
  min-height: 180rpx;
  padding: 12rpx;
  background: #ffffff;
  border-radius: 12rpx;
  border: 1rpx solid $color-border;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  align-content: flex-start;
  margin-bottom: 16rpx;
  box-sizing: border-box;
}

.pick-chip {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: #4a90e2;
}

.pick-chip__t {
  font-size: 22rpx;
  color: #ffffff;
  margin-right: 8rpx;
}

.pick-chip__x {
  font-size: 28rpx;
  color: #ffffff;
  line-height: 1;
}

.muted {
  font-size: $font-size-sm;
  color: $color-text-secondary;
}

.env-tabs {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 12rpx;
}

.env-tabs__t {
  font-size: 22rpx;
  color: $color-text-secondary;
  padding-bottom: 8rpx;
  border-bottom: 4rpx solid transparent;
}

.env-tabs__t--on {
  color: #4a90e2;
  border-bottom-color: #4a90e2;
}

.tag-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.tag-cell {
  padding: 12rpx 16rpx;
  border-radius: 999rpx;
  border: 1rpx solid $color-border;
  background: #ffffff;
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

.mbti-hdr {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8rpx 8rpx;
}

.mbti-hdr--low {
  margin-top: 8rpx;
}

.mbti-hdr__c {
  width: 25%;
  text-align: center;
  font-size: 20rpx;
  color: $color-text-secondary;
}

.mbti-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 8rpx;
}

.mbti-cell {
  width: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx;
  box-sizing: border-box;
}

.mbti-cell__l {
  width: 100rpx;
  height: 100rpx;
  line-height: 100rpx;
  text-align: center;
  border-radius: 16rpx;
  border: 1rpx solid #cccccc;
  background: #ffffff;
  font-size: 32rpx;
  color: $color-text-secondary;
}

.mbti-cell--on .mbti-cell__l {
  background: #4a90e2;
  border-color: #4a90e2;
  color: #ffffff;
}

.mbti-sum {
  display: block;
  text-align: center;
  margin: 24rpx 0;
  font-size: $font-size-base;
  color: $color-text-primary;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  height: 141px;
  z-index: 10;
  padding: 16rpx $page-padding-x;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top: 1rpx solid $color-border;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.cta {
  width: 396rpx;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #4a90e2;
  color: #ffffff;
  font-size: $font-size-base;
  margin-top: 8rpx;

  &::after {
    border: none;
  }
}

.footer__link {
  margin-top: 12rpx;
  font-size: $font-size-sm;
  color: #4a90e2;
}
</style>
