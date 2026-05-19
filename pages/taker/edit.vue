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

    <scroll-view
      v-else
      scroll-y
      class="scroll"
      :style="{ height: scrollH + 'px' }"
    >
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

        <text class="label">*慢性病史</text>
        <view class="input input--hit" @tap="showDisease = true">
          <text :class="chronicFieldClass">{{ chronicDisplay }}</text>
        </view>

        <text class="label">*标签</text>
        <view class="chip-row">
          <text v-for="(c, i) in tagChips" :key="'t-' + i" class="chip">{{ c }}</text>
          <view class="chip chip--add" @tap="showTag = true">
            <text class="chip__plus">+</text>
          </view>
        </view>

        <text class="label">护理等级</text>
        <picker
          mode="selector"
          :range="careLevelRange"
          :value="careLevelPickerIndex"
          @change="onCareLevelChange"
        >
          <view class="input input--hit">
            <text :class="careFieldClass">{{ careLevelLabel }}</text>
          </view>
        </picker>

        <text class="label">分配护工</text>
        <picker
          mode="selector"
          :range="giverPickerRange"
          :value="giverPickerIndex"
          @change="onGiverChange"
        >
          <view class="input input--hit">
            <text :class="giverFieldClass">{{ giverDisplay }}</text>
          </view>
        </picker>

        <text class="label">*状态</text>
        <picker mode="selector" :range="statusRange" :value="statusIndex" @change="onStatusChange">
          <view class="input input--hit">
            <text class="bd-t">{{ statusLabel }}</text>
          </view>
        </picker>
      </view>
    </scroll-view>

    <BirthdayPicker
      :visible="showBirth"
      :value="form.birthday"
      wizard-kind="taker"
      @close="showBirth = false"
      @confirm="onBirthConfirm"
    />

    <DiseasePicker
      :visible="showDisease"
      :value="selectedDiseases"
      @close="showDisease = false"
      @confirm="onDiseaseConfirm"
    />

    <MbtiPicker
      :visible="showMbti"
      :value="form.mbti"
      @close="showMbti = false"
      @confirm="(s) => (form.mbti = s)"
    />

    <TagPicker :visible="showTag" :value="form.env_tags" @close="showTag = false" @confirm="onTagsConfirm" />

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
import DiseasePicker from '@/components/common/DiseasePicker.vue'
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
const showDisease = ref(false)
const showMbti = ref(false)
const showTag = ref(false)

const selectedDiseases = ref(['无'])

const giverRows = ref([])

const form = reactive({
  name: '',
  gender: '',
  birthday: null,
  wuxing: '',
  sixiang: '',
  constellation: '',
  mbti: '',
  chronic_disease: '',
  env_tags: {
    hobby: [],
    lifestyle: [],
    personality: [],
    comm_style: []
  },
  care_level: null,
  assigned_giver_id: '',
  status: 'active'
})

const careLevelRange = ['请选择', '1 自理', '2 轻度', '3 中度', '4 重度', '5 特重']
const statusRange = ['有效', '停用', '归档']
const statusValues = ['active', 'inactive', 'archived']

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

const chronicFieldClass = computed(() =>
  chronicDisplay.value && chronicDisplay.value !== '无' ? 'bd-t' : 'bd-t bd-t--ph'
)

const chronicDisplay = computed(() => {
  if (selectedDiseases.value.includes('无') || !selectedDiseases.value.length) return '无'
  return selectedDiseases.value.join('、')
})

const careLevelLabel = computed(() => {
  const c = form.care_level
  if (typeof c !== 'number' || c < 1 || c > 5) return '请选择'
  return careLevelRange[c]
})

const careFieldClass = computed(() =>
  typeof form.care_level === 'number' && form.care_level >= 1 && form.care_level <= 5
    ? 'bd-t'
    : 'bd-t bd-t--ph'
)

const careLevelPickerIndex = computed(() => {
  const c = form.care_level
  if (typeof c !== 'number' || c < 1 || c > 5) return 0
  return c
})

function onCareLevelChange(e) {
  const i = Number(e.detail.value)
  form.care_level = i === 0 ? null : i
}

const giverPickerRange = computed(() => {
  const names = giverRows.value.map((g) => g.name || '未命名')
  return ['请选择', ...names]
})

const giverPickerIndex = computed(() => {
  const id = form.assigned_giver_id
  if (!id) return 0
  const idx = giverRows.value.findIndex((g) => g._id === id)
  return idx >= 0 ? idx + 1 : 0
})

const giverDisplay = computed(() => {
  if (!form.assigned_giver_id) return '请选择'
  const g = giverRows.value.find((x) => x._id === form.assigned_giver_id)
  return g?.name || '—'
})

const giverFieldClass = computed(() =>
  form.assigned_giver_id ? 'bd-t' : 'bd-t bd-t--ph'
)

function onGiverChange(e) {
  const i = Number(e.detail.value)
  if (i === 0) {
    form.assigned_giver_id = ''
    return
  }
  const g = giverRows.value[i - 1]
  form.assigned_giver_id = g ? g._id : ''
}

const statusIndex = computed(() => {
  const i = statusValues.indexOf(form.status)
  return i >= 0 ? i : 0
})

const statusLabel = computed(() => {
  const i = statusValues.indexOf(form.status)
  return i >= 0 ? statusRange[i] : statusRange[0]
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
  const { wuxing } = calcWuxingFromBirthday(year, month, day)
  const { sixiang, constellation } = calcSixiangFromBirthday(month, day)
  form.wuxing = wuxing
  form.sixiang = sixiang
  form.constellation = constellation || ''
}

function onBirthConfirm(payload) {
  form.birthday = payload
  showBirth.value = false
  syncBirthDerived()
}

function onDiseaseConfirm(arr) {
  selectedDiseases.value = Array.isArray(arr) && arr.length ? arr : ['无']
  form.chronic_disease = normalizeChronicString()
}

function onTagsConfirm(payload) {
  const v = payload || {}
  form.env_tags = {
    hobby: [...(v.hobby || [])],
    lifestyle: [...(v.lifestyle || [])],
    personality: [...(v.personality || [])],
    comm_style: [...(v.comm_style || [])]
  }
}

function normalizeChronicString() {
  if (selectedDiseases.value.includes('无')) return '无'
  return selectedDiseases.value.join('，')
}

function hydrateChronicFromDoc(raw) {
  if (Array.isArray(raw)) {
    const arr = raw.map((x) => String(x).trim()).filter(Boolean)
    selectedDiseases.value = arr.length ? arr : ['无']
    return
  }
  const s = String(raw || '').trim()
  if (!s) {
    selectedDiseases.value = ['无']
    return
  }
  const arr = s.split(/[,，]/).map((x) => x.trim()).filter(Boolean)
  selectedDiseases.value = arr.length ? arr : ['无']
}

async function loadGivers() {
  try {
    const gm = uniCloud.importObject('giver-manager')
    const gr = await gm.getGiverList({ page: 1, pageSize: 500 })
    const raw = Array.isArray(gr?.data) ? gr.data : []
    giverRows.value = raw.filter((x) => x && !x.is_deleted)
  } catch {
    giverRows.value = []
  }
}

async function load() {
  if (!currentId.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    await loadGivers()
    const tm = uniCloud.importObject('taker-manager')
    const res = await tm.getTakerDetail({ id: currentId.value })
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
    hydrateChronicFromDoc(d.chronic_disease)
    form.chronic_disease = normalizeChronicString()
    if (d.env_tags && typeof d.env_tags === 'object') {
      form.env_tags.hobby = [...(d.env_tags.hobby || [])]
      form.env_tags.lifestyle = [...(d.env_tags.lifestyle || [])]
      form.env_tags.personality = [...(d.env_tags.personality || [])]
      form.env_tags.comm_style = [...(d.env_tags.comm_style || [])]
    }
    form.care_level =
      typeof d.care_level === 'number' && !Number.isNaN(d.care_level)
        ? Math.max(1, Math.min(5, Math.round(d.care_level)))
        : null
    form.assigned_giver_id =
      d.assigned_giver_id ||
      d.matched_giver_id ||
      d.linked_giver_id ||
      ''
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

  saving.value = true
  uni.showLoading({ title: '保存中...', mask: true })
  syncBirthDerived()
  const { year, month, day } = form.birthday.solar
  const age = new Date().getFullYear() - year

  try {
    const tm = uniCloud.importObject('taker-manager')
    const payload = {
      id: currentId.value,
      name,
      gender: form.gender,
      birthday: form.birthday,
      age,
      wuxing: form.wuxing,
      sixiang: form.sixiang,
      constellation: form.constellation,
      mbti: form.mbti,
      chronic_disease: normalizeChronicString(),
      env_tags: {
        hobby: [...(form.env_tags.hobby || [])],
        lifestyle: [...(form.env_tags.lifestyle || [])],
        personality: [...(form.env_tags.personality || [])],
        comm_style: [...(form.env_tags.comm_style || [])]
      },
      assigned_giver_id: form.assigned_giver_id ? String(form.assigned_giver_id) : '',
      status: form.status || 'active',
      is_matched: !!String(form.assigned_giver_id || '').trim()
    }
    if (typeof form.care_level === 'number') payload.care_level = form.care_level
    await tm.updateTaker(payload)
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 400)
  } catch (e) {
    uni.showToast({ title: parseCloudError(e), icon: 'none' })
  } finally {
    saving.value = false
    uni.hideLoading()
  }
}

function confirmDelete() {
  if (!currentId.value) return
  uni.showModal({
    title: '确认删除',
    content: '删除后可在后台恢复（软删除），确定吗？',
    success: async (res) => {
      if (!res.confirm) return
      uni.showLoading({ title: '处理中', mask: true })
      try {
        const tm = uniCloud.importObject('taker-manager')
        await tm.deleteTaker({ id: currentId.value })
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
  box-sizing: border-box;
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
