<template>
  <view class="page">
    <u-navbar
      title="个人信息"
      :fixed="true"
      :placeholder="true"
      :safe-area-inset-top="true"
      bg-color="#ffffff"
      :auto-back="true"
      left-icon="arrow-left"
    />

    <view v-if="loading" class="state">
      <text class="muted">加载中…</text>
    </view>

    <scroll-view v-else scroll-y class="scroll" :style="{ height: scrollH + 'px' }">
      <view class="pad">
        <text class="label">*你的名字</text>
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

        <view style="display:flex;gap:20rpx;margin-top:16rpx">
          <view style="flex:1">
            <text class="label field-label">五行</text>
            <view class="readonly-field">{{ wuxingLabel(form.wuxing) }}</view>
          </view>
          <view style="flex:1">
            <text class="label field-label">星座</text>
            <view class="readonly-field">{{ form.constellation || '—' }}</view>
          </view>
        </view>

        <text class="label">*MBTI</text>
        <view class="input input--hit" @tap="showMbti = true">
          <text :class="mbtiFieldClass">{{ form.mbti || '请选择' }}</text>
        </view>

        <text class="label">*工龄（年）</text>
        <view class="input input--hit" @tap="openExpPanel">
          <text :class="expFieldClass">{{ experienceDisplay }}</text>
        </view>

        <text class="label">*标签</text>
        <view class="chip-row">
          <text v-for="(c, i) in tagChips" :key="'t-' + i" class="chip">{{ c }}</text>
          <view class="chip chip--add" @tap="showTag = true">
            <text class="chip__plus">+</text>
          </view>
        </view>

        <text class="label">擅长方向</text>
        <picker
          mode="selector"
          :range="specialtyRange"
          :value="specialtyPickerIndex"
          @change="onSpecialtyPick"
        >
          <view class="input input--hit">
            <text :class="speFieldClass">{{ specialtyDisplay }}</text>
          </view>
        </picker>

        <text class="label">设置服务数量</text>
        <input
          class="input"
          type="number"
          :value="String(form.max_taker_count)"
          placeholder="1～10"
          placeholder-class="input-ph"
          @blur="onMaxBlur"
          @input="onMaxInput"
        />

        <text class="label">*状态</text>
        <picker mode="selector" :range="statusRangeLabels" :value="statusIndex" @change="onStatusChange">
          <view class="input input--hit">
            <text class="bd-t">{{ statusLabel }}</text>
          </view>
        </picker>
      </view>
    </scroll-view>

    <BirthdayPicker
      :visible="showBirth"
      :value="form.birthday"
      wizard-kind="giver"
      @close="showBirth = false"
      @confirm="onBirthConfirm"
    />

    <MbtiPicker
      :visible="showMbti"
      :value="form.mbti"
      @close="showMbti = false"
      @confirm="(s) => (form.mbti = s)"
    />

    <TagPicker :visible="showTag" :value="form.env_tags" @close="showTag = false" @confirm="onTagsConfirm" />

    <view v-if="showExpPanel">
      <view
        style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:100"
        @tap="showExpPanel = false"
      />
      <view
        style="position:fixed;bottom:0;left:0;width:100%;background:#fff;border-radius:32rpx 32rpx 0 0;z-index:101;padding-bottom:env(safe-area-inset-bottom)"
        @tap.stop
      >
        <view
          style="display:flex;justify-content:space-between;align-items:center;padding:32rpx 40rpx;border-bottom:1rpx solid #eee"
        >
          <text style="font-size:36rpx;font-weight:600">工龄（年）</text>
          <text style="font-size:28rpx;color:#999" @tap="showExpPanel = false">关闭</text>
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

    <view class="footer">
      <button class="cta" :disabled="saving || !currentId" @tap="save">保存</button>
      <text class="del" @tap="confirmDelete">删除</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BirthdayPicker from '@/components/common/BirthdayPicker.vue'
import MbtiPicker from '@/components/common/MbtiPicker.vue'
import TagPicker from '@/components/common/TagPicker.vue'
import {
  calcWuxingFromBirthday,
  calcSixiangFromBirthday
} from '@/utils/lunar.js'
import { formatWuxing as wuxingLabel } from '@/utils/format.js'
import { parseCloudError } from '@/utils/cloud-error.js'

const currentId = ref('')
const loading = ref(true)
const saving = ref(false)
const scrollH = ref(500)
const showBirth = ref(false)
const showMbti = ref(false)
const showTag = ref(false)
const showExpPanel = ref(false)

const experienceOptions = Array.from({ length: 51 }, (_, i) => `${i}年`)
const experienceIndex = ref([0])

const specialtyStrings = [
  '失能照护',
  '半失能照护',
  '慢病管理',
  '术后护理',
  '认知症照护',
  '轻度照护'
]
const specialtyRange = ['请选择', ...specialtyStrings]

const statusRangeLabels = ['有效', '停用', '归档']
const statusValues = ['active', 'inactive', 'archived']

const form = reactive({
  name: '',
  gender: '',
  birthday: null,
  wuxing: '',
  sixiang: '',
  constellation: '',
  mbti: '',
  experience_years: null,
  env_tags: {
    hobby: [],
    lifestyle: [],
    personality: [],
    comm_style: []
  },
  qualification: '',
  max_taker_count: 5,
  status: 'active'
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

const mbtiFieldClass = computed(() =>
  form.mbti && form.mbti.length === 4 ? 'bd-t' : 'bd-t bd-t--ph'
)

const experienceDisplay = computed(() =>
  form.experience_years === null || form.experience_years === undefined
    ? '请选择'
    : `${form.experience_years}年`
)

const expFieldClass = computed(() =>
  form.experience_years === null || form.experience_years === undefined ? 'bd-t bd-t--ph' : 'bd-t'
)

const specialtyDisplay = computed(() => {
  const q = String(form.qualification || '').trim()
  return q || '请选择'
})

const speFieldClass = computed(() =>
  String(form.qualification || '').trim() ? 'bd-t' : 'bd-t bd-t--ph'
)

const specialtyPickerIndex = computed(() => {
  const q = String(form.qualification || '').trim()
  const i = specialtyStrings.indexOf(q)
  return i >= 0 ? i + 1 : 0
})

function onSpecialtyPick(e) {
  const i = Number(e.detail.value)
  form.qualification = i === 0 ? '' : specialtyStrings[i - 1] || ''
}

const statusIndex = computed(() => {
  const i = statusValues.indexOf(form.status)
  return i >= 0 ? i : 0
})

const statusLabel = computed(() => {
  const i = statusValues.indexOf(form.status)
  return i >= 0 ? statusRangeLabels[i] : statusRangeLabels[0]
})

function onStatusChange(e) {
  const i = Number(e.detail.value)
  form.status = statusValues[i] || 'active'
}

const tagChips = computed(() => {
  const out = []
  const env = form.env_tags
  if (!env || typeof env !== 'object') return out
  ;['hobby', 'lifestyle', 'personality', 'comm_style'].forEach((k) => {
    const arr = env[k]
    if (Array.isArray(arr)) out.push(...arr)
  })
  return out
})

function layout() {
  const s = uni.getSystemInfoSync()
  const nav = (s.statusBarHeight || 20) + 44
  const foot = uni.upx2px(200)
  scrollH.value = Math.max(200, s.windowHeight - nav - foot)
}

function syncBirthDerived() {
  if (!form.birthday?.solar) {
    form.wuxing = ''
    form.sixiang = ''
    form.constellation = ''
    return
  }
  const { year, month, day } = form.birthday.solar
  form.wuxing = calcWuxingFromBirthday(year, month, day).wuxing
  const { sixiang, constellation } = calcSixiangFromBirthday(month, day)
  form.sixiang = sixiang
  form.constellation = constellation || ''
}

function onBirthConfirm(payload) {
  form.birthday = payload
  showBirth.value = false
  syncBirthDerived()
}

function onTagsConfirm(v) {
  const payload = v || {}
  form.env_tags = {
    hobby: [...(payload.hobby || [])],
    lifestyle: [...(payload.lifestyle || [])],
    personality: [...(payload.personality || [])],
    comm_style: [...(payload.comm_style || [])]
  }
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

function onMaxInput(e) {
  const n = parseInt(String(e.detail.value || ''), 10)
  if (Number.isNaN(n)) {
    form.max_taker_count = 5
    return
  }
  form.max_taker_count = Math.max(1, Math.min(10, n))
}

function onMaxBlur() {
  const n = Number(form.max_taker_count)
  if (Number.isNaN(n) || n < 1) form.max_taker_count = 5
  else form.max_taker_count = Math.min(10, Math.round(n))
}

async function load() {
  if (!currentId.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const gm = uniCloud.importObject('giver-manager')
    const res = await gm.getGiverDetail({ id: currentId.value })
    const d = res?.data
    if (!d) {
      loading.value = false
      return
    }
    form.name = d.name || ''
    form.gender = d.gender || ''
    form.birthday = d.birthday || null
    form.mbti = d.mbti || ''
    form.wuxing = d.wuxing || ''
    form.sixiang = d.sixiang || ''
    form.constellation = d.constellation || ''
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
    form.qualification = d.qualification ? String(d.qualification) : ''
    const m = typeof d.max_taker_count === 'number' ? Math.round(d.max_taker_count) : 5
    form.max_taker_count = m >= 1 && m <= 10 ? m : 5
    form.status =
      ['active', 'inactive', 'archived'].includes(d.status) ? d.status : 'active'
    syncBirthDerived()
  } catch {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

onLoad((opts) => {
  currentId.value = (opts && opts.id) || ''
})

onMounted(async () => {
  layout()
  await load()
})

async function save() {
  const name = String(form.name || '').trim()
  if (!name) {
    uni.showToast({ title: '请填写姓名', icon: 'none' })
    return
  }
  if (!form.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }
  if (!form.birthday?.solar) {
    uni.showToast({ title: '请设置生日', icon: 'none' })
    return
  }
  if (!form.mbti || form.mbti.length !== 4) {
    uni.showToast({ title: '请选择完整 MBTI', icon: 'none' })
    return
  }
  if (form.experience_years === null || form.experience_years === undefined) {
    uni.showToast({ title: '请选择工龄', icon: 'none' })
    return
  }
  if (totalTagsCount() < 1) {
    uni.showToast({ title: '请至少选择 1 个标签', icon: 'none' })
    return
  }

  saving.value = true
  uni.showLoading({ title: '保存中...', mask: true })
  syncBirthDerived()
  const { year } = form.birthday.solar
  const age = new Date().getFullYear() - year

  try {
    const gm = uniCloud.importObject('giver-manager')
    await gm.updateGiver({
      id: currentId.value,
      name,
      gender: form.gender,
      birthday: form.birthday,
      age,
      wuxing: form.wuxing,
      sixiang: form.sixiang,
      constellation: form.constellation,
      mbti: form.mbti,
      experience_years: form.experience_years ?? 0,
      qualification: String(form.qualification || '').trim(),
      env_tags: {
        hobby: [...(form.env_tags.hobby || [])],
        lifestyle: [...(form.env_tags.lifestyle || [])],
        personality: [...(form.env_tags.personality || [])],
        comm_style: [...(form.env_tags.comm_style || [])]
      },
      max_taker_count: form.max_taker_count,
      status: form.status || 'active'
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 400)
  } catch (e) {
    uni.showToast({ title: parseCloudError(e), icon: 'none' })
  } finally {
    saving.value = false
    uni.hideLoading()
  }
}

function totalTagsCount() {
  let n = 0
  ;['hobby', 'lifestyle', 'personality', 'comm_style'].forEach((k) => {
    n += (form.env_tags[k] || []).length
  })
  return n
}

function confirmDelete() {
  if (!currentId.value) return
  uni.showModal({
    title: '确认删除',
    content: '删除后可通过状态恢复标记（软删除），确定吗？',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '处理中', mask: true })
      try {
        const gm = uniCloud.importObject('giver-manager')
        await gm.deleteGiver({ id: currentId.value })
        uni.showToast({ title: '已删除', icon: 'success' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/admin/files' })
        }, 400)
      } catch (e) {
        uni.showToast({ title: parseCloudError(e), icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.scroll {
  width: 100%;
}

.pad {
  padding: 24rpx $page-padding-x 24rpx;
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
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
  background: #fff;
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

.readonly-field,
.readonly-input {
  margin-top: 8rpx;
  min-height: 80rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  border-radius: 12rpx;
  background: #f5f5f5;
  border: 1rpx solid #e8e8e8;
  font-size: $font-size-base;
  color: #999;
}

.field-label {
  margin-top: 0;
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
  background: #fff;
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
  color: #fff;
}

.chip-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
  margin-bottom: 8rpx;
}

.chip {
  font-size: 22rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: rgba(74, 144, 226, 0.12);
  color: #4a90e2;
}

.chip--add {
  min-width: 56rpx;
  text-align: center;
  background: #fff;
  border: 2rpx dashed #ccc;
  color: #999;
}

.chip__plus {
  font-size: 32rpx;
  line-height: 1;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx $page-padding-x;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid $color-border;
}

.cta {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  border-radius: 48rpx;
  background: #4a90e2;
  color: #fff;
  font-size: $font-size-base;

  &::after {
    border: none;
  }
}

.del {
  display: block;
  text-align: center;
  margin-top: 20rpx;
  font-size: $font-size-sm;
  color: #999;
}

.state {
  padding: 120rpx 24rpx;
  display: flex;
  justify-content: center;
}

.muted {
  font-size: $font-size-base;
  color: $color-text-secondary;
}
</style>
