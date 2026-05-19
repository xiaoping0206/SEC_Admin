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
        <text class="nav__ttl ff-yuan">个人资料</text>
      </view>
    </view>

    <view v-if="loading" class="state" :style="{ paddingTop: navOuterPx + 'px' }">
      <text class="state__txt ff-yuan">加载中…</text>
    </view>

    <scroll-view
      v-else
      scroll-y
      class="scroll"
      :style="{ height: scrollH + 'px', paddingTop: navOuterPx + 'px' }"
      :show-scrollbar="false"
    >
      <view class="body">
        <text class="s1-label ff-yuan">*名字</text>
        <input
          class="s1-field s1-field--input ff-yuan"
          type="text"
          :value="form.name"
          maxlength="20"
          placeholder="请输入"
          placeholder-class="s1-ph"
          @input="form.name = $event.detail.value"
        />

        <text class="s1-label ff-yuan">*性别</text>
        <view class="s1-gender">
          <view class="s1-gender__item" @tap="form.gender = 'female'">
            <image
              class="s1-gender__ava"
              src="/static/figma/taker-form/gender_female.png"
              mode="aspectFit"
            />
            <view
              class="s1-gender__pill"
              :class="{ 's1-gender__pill--on': form.gender === 'female' }"
            >
              <text
                class="s1-gender__txt ff-yuan"
                :class="{ 's1-gender__txt--on': form.gender === 'female' }"
              >
                女
              </text>
            </view>
          </view>
          <view class="s1-gender__item" @tap="form.gender = 'male'">
            <image
              class="s1-gender__ava"
              src="/static/figma/taker-form/gender_male.png"
              mode="aspectFit"
            />
            <view
              class="s1-gender__pill"
              :class="{ 's1-gender__pill--on': form.gender === 'male' }"
            >
              <text
                class="s1-gender__txt ff-yuan"
                :class="{ 's1-gender__txt--on': form.gender === 'male' }"
              >
                男
              </text>
            </view>
          </view>
        </view>

        <text class="s1-label ff-yuan">*生日</text>
        <view class="s1-field s1-field--hit" @tap="showBirth = true">
          <text :class="birthHintClass">{{ birthDisplay }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>

        <view class="dual-row">
          <view class="dual-row__col">
            <text class="s1-label ff-yuan">五行</text>
            <view class="s1-field s1-field--ro">
              <text class="s1-ro ff-yuan">{{ wuxingLabel(form.wuxing) || '—' }}</text>
            </view>
          </view>
          <view class="dual-row__col">
            <text class="s1-label ff-yuan">星座</text>
            <view class="s1-field s1-field--ro">
              <text class="s1-ro ff-yuan">{{ form.constellation || '—' }}</text>
            </view>
          </view>
        </view>

        <text class="s1-label ff-yuan">MBTI</text>
        <view class="s1-field s1-field--hit" @tap="showMbti = true">
          <text :class="mbtiFieldClass">{{ form.mbti || '请选择' }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>

        <text class="s1-label ff-yuan">*慢性病</text>
        <view class="s1-field s1-field--hit" @tap="showDisease = true">
          <text :class="chronicFieldClass">{{ chronicDisplay }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>

        <text class="s1-label ff-yuan">标签</text>
        <view class="s1-field s1-field--hit s1-field--tags" @tap="goTags">
          <view class="tag-inline">
            <template v-if="tagChips.length">
              <text
                v-for="(c, i) in tagChips"
                :key="'t-' + i"
                class="tag-inline__chip ff-yuan"
              >
                {{ c }}
              </text>
            </template>
            <text v-else class="s1-ph ff-yuan">请选择</text>
          </view>
          <view class="tag-add" @tap.stop="goTags">
            <text class="tag-add__plus">+</text>
          </view>
        </view>

        <text class="s1-label ff-yuan">护理等级</text>
        <view class="s1-field s1-field--hit" @tap="showCareLevel = true">
          <text :class="careFieldClass">{{ careLevelLabel }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>

        <text class="s1-label ff-yuan">分配护工</text>
        <picker
          mode="selector"
          :range="giverPickerRange"
          :value="giverPickerIndex"
          @change="onGiverChange"
        >
          <view class="s1-field s1-field--hit">
            <text :class="giverFieldClass">{{ giverDisplay }}</text>
            <image
              class="s1-field__chev"
              src="/static/figma/taker-form/ic_chevron.svg"
              mode="aspectFit"
            />
          </view>
        </picker>

        <text class="s1-label ff-yuan">状态</text>
        <view class="s1-field s1-field--hit" @tap="showStatus = true">
          <text class="s1-val ff-yuan">{{ statusLabel }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>
      </view>
    </scroll-view>

    <BirthdayPicker
      :visible="showBirth"
      :value="form.birthday"
      wizard-kind="taker"
      @close="showBirth = false"
      @confirm="onBirthConfirm"
    />

    <ChronicDiseasePicker
      :visible="showDisease"
      :options="diseaseOptions"
      :initial-value="chronicInitialValue"
      @close="showDisease = false"
      @confirm="onDiseaseConfirm"
    />

    <MbtiPicker
      :visible="showMbti"
      :value="form.mbti"
      @close="showMbti = false"
      @confirm="onMbtiConfirm"
    />

    <CareLevelPicker
      :visible="showCareLevel"
      :options="careLevelPickerOptions"
      :initial-index="careLevelPickerIndex"
      @close="showCareLevel = false"
      @confirm="onCareLevelConfirm"
    />

    <StatusPicker
      :visible="showStatus"
      :options="statusRange"
      :initial-index="statusIndex"
      @close="showStatus = false"
      @confirm="onStatusConfirm"
    />

    <view v-if="!loading" class="edit-foot">
      <view class="edit-foot__fade" />
      <button
        class="edit-foot__btn ff-yuan"
        :disabled="saving || !currentId"
        @tap="save"
      >
        保存
      </button>
      <text class="edit-foot__del ff-yuan" @tap="confirmDelete">删除</text>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import BirthdayPicker from '@/components/common/BirthdayPicker.vue'
import ChronicDiseasePicker from '@/components/common/ChronicDiseasePicker.vue'
import MbtiPicker from '@/components/common/MbtiPicker.vue'
import CareLevelPicker from '@/components/common/CareLevelPicker.vue'
import StatusPicker from '@/components/common/StatusPicker.vue'
import { deriveBirthFields } from '@/utils/lunar.js'
import { formatWuxing as wuxingLabel, normalizeBirthday } from '@/utils/format.js'
import { parseCloudError } from '@/utils/cloud-error.js'
import { useRulesStore } from '@/store/rules.js'
import { envTagsToDisplayList, normalizeStoredEnvTags } from '@/utils/env-tags.js'

const currentId = ref('')
const loading = ref(true)
const saving = ref(false)
const scrollH = ref(500)

const statusBarPx = ref(20)
const navBarPx = ref(44)
const navOuterPx = ref(64)

const showBirth = ref(false)
const showDisease = ref(false)
const showMbti = ref(false)
const showCareLevel = ref(false)
const showStatus = ref(false)

const diseaseOptions = [
  '无',
  '糖尿病',
  '心脏病',
  '高血压',
  '阿尔兹海默症',
  '关节炎',
  '慢阻肺',
  '脑卒中后遗症'
]

const selectedDiseases = ref(['无'])

const giverRows = ref([])
const rulesStore = useRulesStore()

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

const careLevelPickerOptions = ['请选择', '1 自理', '2 轻度', '3 中度', '4 重度', '5 特重']
const careLevelRange = careLevelPickerOptions
const statusRange = ['有效', '停用', '归档']
const statusValues = ['active', 'inactive', 'archived']

const birthDisplay = computed(() => {
  const b = form.birthday
  if (!b || !b.solar) return '请设置生日'
  const sy = b.solar
  const mo = `${sy.month}`.padStart(2, '0')
  const d = `${sy.day}`.padStart(2, '0')
  const kind = b.type === 'lunar' ? '农历' : '阳历'
  return `${sy.year}年${mo}月${d}日（${kind}）`
})

const birthHintClass = computed(() =>
  form.birthday && form.birthday.solar ? 's1-val ff-yuan' : 's1-ph ff-yuan'
)

const mbtiFieldClass = computed(() =>
  form.mbti && form.mbti.length === 4 ? 's1-val ff-yuan' : 's1-ph ff-yuan'
)

const chronicFieldClass = computed(() =>
  chronicDisplay.value ? 's1-val ff-yuan' : 's1-ph ff-yuan'
)

const chronicInitialValue = computed(() => selectedDiseases.value[0] || '无')

const chronicDisplay = computed(() => selectedDiseases.value[0] || '无')

const careLevelLabel = computed(() => {
  const c = form.care_level
  if (typeof c !== 'number' || c < 1 || c > 5) return '请选择'
  return careLevelRange[c]
})

const careFieldClass = computed(() =>
  typeof form.care_level === 'number' && form.care_level >= 1 && form.care_level <= 5
    ? 's1-val ff-yuan'
    : 's1-ph ff-yuan'
)

const careLevelPickerIndex = computed(() => {
  const c = form.care_level
  if (typeof c !== 'number' || c < 1 || c > 5) return 0
  return c
})

function onCareLevelConfirm(index) {
  const i = Number(index)
  form.care_level = i === 0 ? null : i
  showCareLevel.value = false
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
  form.assigned_giver_id ? 's1-val ff-yuan' : 's1-ph ff-yuan'
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

function onStatusConfirm(index) {
  const i = Number(index)
  form.status = statusValues[i] || 'active'
  showStatus.value = false
}

function goTags() {
  uni.navigateTo({
    url: '/pages/taker/tags',
    events: {
      confirm: (payload) => {
        const normalized = normalizeStoredEnvTags(payload || {}, rulesStore.envTagGroups)
        form.env_tags.hobby = [...(normalized.hobby || [])]
        form.env_tags.lifestyle = [...(normalized.lifestyle || [])]
        form.env_tags.personality = [...(normalized.personality || [])]
        form.env_tags.comm_style = [...(normalized.comm_style || [])]
      }
    },
    success(res) {
      res.eventChannel.emit('init', {
        env_tags: {
          hobby: [...(form.env_tags.hobby || [])],
          lifestyle: [...(form.env_tags.lifestyle || [])],
          personality: [...(form.env_tags.personality || [])],
          comm_style: [...(form.env_tags.comm_style || [])]
        }
      })
    }
  })
}

const tagChips = computed(() =>
  envTagsToDisplayList(form.env_tags, rulesStore.envTagGroups)
)

function layoutNav() {
  const s = uni.getSystemInfoSync()
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  navOuterPx.value = statusBarPx.value + navBarPx.value
}

function layout() {
  layoutNav()
  const s = uni.getSystemInfoSync()
  scrollH.value = Math.max(200, s.windowHeight)
}

function goBack() {
  uni.navigateBack()
}

function syncBirthDerived() {
  const derived = deriveBirthFields(form.birthday)
  form.wuxing = derived.wuxing
  form.sixiang = derived.sixiang
  form.constellation = derived.constellation || ''
}

function onBirthConfirm(payload) {
  form.birthday = payload
  showBirth.value = false
  syncBirthDerived()
}

function onDiseaseConfirm(val) {
  selectedDiseases.value = [val || '无']
  form.chronic_disease = normalizeChronicString()
  showDisease.value = false
}

function onMbtiConfirm(s) {
  form.mbti = s
  showMbti.value = false
}

function normalizeChronicString() {
  return selectedDiseases.value[0] || '无'
}

function hydrateChronicFromDoc(raw) {
  if (Array.isArray(raw)) {
    const arr = raw.map((x) => String(x).trim()).filter(Boolean)
    selectedDiseases.value = arr.length ? [arr[0]] : ['无']
    return
  }
  const s = String(raw || '').trim()
  if (!s) {
    selectedDiseases.value = ['无']
    return
  }
  const arr = s.split(/[,，]/).map((x) => x.trim()).filter(Boolean)
  selectedDiseases.value = arr.length ? [arr[0]] : ['无']
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
    await rulesStore.fetchActiveEnvTags()
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
    form.birthday = normalizeBirthday(d.birthday)
    form.mbti = d.mbti || ''
    form.wuxing = d.wuxing || ''
    form.sixiang = d.sixiang || ''
    form.constellation = d.constellation || ''
    hydrateChronicFromDoc(d.chronic_disease)
    form.chronic_disease = normalizeChronicString()
    if (d.env_tags && typeof d.env_tags === 'object') {
      const normalized = normalizeStoredEnvTags(d.env_tags, rulesStore.envTagGroups)
      form.env_tags.hobby = [...(normalized.hobby || [])]
      form.env_tags.lifestyle = [...(normalized.lifestyle || [])]
      form.env_tags.personality = [...(normalized.personality || [])]
      form.env_tags.comm_style = [...(normalized.comm_style || [])]
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
    layout()
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

$match-purple: #9245f9;
$match-purple-light: #c766ff;

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
  padding: 24rpx 40rpx calc(320rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.s1-label {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #6c5c76;
  line-height: normal;
  margin-bottom: 24rpx;
}

.s1-field {
  height: 84rpx;
  margin-bottom: 48rpx;
  padding: 0 40rpx;
  border-radius: 100rpx;
  background: #ffffff;
  box-sizing: border-box;
}

.s1-field--input {
  font-size: 26rpx;
  font-weight: 600;
  color: #31233a;
}

.s1-field--hit {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.s1-field--ro {
  display: flex;
  align-items: center;
  height: 76rpx;
  margin-bottom: 48rpx;
  background: rgba(255, 255, 255, 0.85);
}

.s1-field--tags {
  height: auto;
  min-height: 84rpx;
  padding-top: 16rpx;
  padding-bottom: 16rpx;
}

.s1-ph {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #ddc7f9;
  line-height: normal;
}

.s1-val {
  flex: 1;
  min-width: 0;
  font-size: 26rpx;
  font-weight: 600;
  color: #31233a;
  line-height: normal;
}

.s1-ro {
  font-size: 26rpx;
  font-weight: 600;
  color: #8d7a99;
  line-height: normal;
}

.s1-field__chev {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
  display: block;
}

.dual-row {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
}

.dual-row__col {
  flex: 1;
  min-width: 0;
}

.s1-gender {
  display: flex;
  flex-direction: row;
  gap: 40rpx;
  margin-bottom: 48rpx;
}

.s1-gender__item {
  position: relative;
  width: 200rpx;
  height: 124rpx;
  flex-shrink: 0;
}

.s1-gender__ava {
  position: absolute;
  top: 0;
  right: 0;
  width: 124rpx;
  height: 124rpx;
  z-index: 2;
}

.s1-gender__pill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 76rpx;
  border-radius: 100rpx;
  background: #ffffff;
  border: 2rpx solid transparent;
  display: flex;
  align-items: center;
  padding-left: 40rpx;
  box-sizing: border-box;
}

.s1-gender__pill--on {
  border-color: $match-purple;
}

.s1-gender__txt {
  font-size: 28rpx;
  font-weight: 500;
  color: #31233a;
  line-height: normal;
}

.s1-gender__txt--on {
  font-weight: 700;
  color: $match-purple;
}

.tag-inline {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12rpx;
  align-items: center;
}

.tag-inline__chip {
  padding: 8rpx 20rpx;
  border-radius: 40rpx;
  background: #eadaff;
  font-size: 22rpx;
  font-weight: 500;
  color: #590092;
  line-height: 1.3;
}

.tag-add {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  background: linear-gradient(47deg, $match-purple-light 11.9%, $match-purple 94%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 16rpx;
}

.tag-add__plus {
  font-size: 36rpx;
  font-weight: 500;
  color: #ffffff;
  line-height: 1;
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

.edit-foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 90;
  height: calc(280rpx + env(safe-area-inset-bottom));
  pointer-events: none;
}

.edit-foot__fade {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 120rpx;
  background: linear-gradient(
    180deg,
    rgba(240, 232, 251, 0) 0%,
    #f0e8fb 23.45%,
    #f0e8fb 100%
  );
  pointer-events: none;
}

.edit-foot__btn {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  bottom: calc(88rpx + env(safe-area-inset-bottom));
  height: 96rpx;
  line-height: 96rpx;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: 100rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(47deg, $match-purple-light 11.9%, $match-purple 94%);
  pointer-events: auto;
}

.edit-foot__btn::after {
  border: none;
}

.edit-foot__btn[disabled] {
  opacity: 0.55;
}

.edit-foot__del {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(32rpx + env(safe-area-inset-bottom));
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
  text-align: center;
  line-height: normal;
  pointer-events: auto;
}
</style>
