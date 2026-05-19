<template>
  <view class="page" :class="{ 'page--wizard': step >= 1 && step <= 3 }">
    <!-- Figma 3894:7438 / 7504 / 7566 — 自定义导航 -->
    <view v-if="step >= 1 && step <= 3" class="wiz-nav" :style="{ paddingTop: statusBarPx + 'px' }">
      <view class="wiz-nav__bar" :style="{ height: navBarPx + 'px' }">
        <view class="wiz-nav__back" @tap="goBack">
          <image
            class="wiz-nav__back-ico"
            src="/static/figma/taker-form/ic_back.svg"
            mode="aspectFit"
          />
        </view>
      </view>
      <view class="wiz-progress">
        <view class="wiz-progress__fill" :style="{ width: progressBarPct }" />
      </view>
    </view>

    <scroll-view
      v-if="step !== 2"
      scroll-y
      class="scroll"
      :class="{ 'scroll--s1': step === 1, 'scroll--s3': step === 3 }"
      :style="wizardScrollStyle"
    >
      <!-- Figma 3894:7438 Step 1 -->
      <block v-if="step === 1">
        <view class="s1-head">
          <view class="s1-banner">
            <image
              class="s1-banner__ico"
              src="/static/figma/taker-form/banner_heart.png"
              mode="aspectFit"
            />
            <text class="s1-banner__ttl ff-yuan">填写你的资料！</text>
          </view>
        </view>

        <text class="s1-label ff-yuan">*你的名字</text>
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
          <view
            class="s1-gender__item"
            @tap="form.gender = 'female'"
          >
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
          <view
            class="s1-gender__item"
            @tap="form.gender = 'male'"
          >
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

        <text class="s1-label ff-yuan">*设置生日</text>
        <view class="s1-field s1-field--hit" @tap="showBirth = true">
          <text :class="birthHintClass">{{ birthDisplay }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>

        <text class="s1-label ff-yuan">*慢性病</text>
        <view class="s1-field s1-field--hit s1-field--last" @tap="openDiseasePanel">
          <text :class="chronicHintClass">{{ chronicFieldText }}</text>
          <image
            class="s1-field__chev"
            src="/static/figma/taker-form/ic_chevron.svg"
            mode="aspectFit"
          />
        </view>

        <view v-if="editId" class="form-item-assign">
          <text class="s1-label ff-yuan">分配护工</text>
          <text class="assign-hint">{{ assignGiverLine }}</text>
        </view>
      </block>

      <!-- Figma 3894:7566 Step 3 -->
      <block v-if="step === 3">
        <view class="s3-head">
          <text class="s3-skip ff-yuan" @tap="finishSkipMbti">跳过</text>
          <view class="s3-banner">
            <image
              class="s3-banner__ico"
              src="/static/figma/taker-form/banner_heart.png"
              mode="aspectFit"
            />
            <text class="s3-banner__ttl ff-yuan">选择你的MBTI !!</text>
          </view>
        </view>
      </block>
    </scroll-view>

    <!-- Figma 7566：底行维度文字底边距屏底 600 -->
    <view v-if="step === 3" class="s3-grid">
      <view
        v-for="(pair, col) in mbtiPairs"
        :key="'mbti-col-' + col"
        class="s3-col"
      >
        <text class="s3-col__lab ff-yuan">{{ mbtiTopLabels[col] }}</text>
        <view
          class="s3-col__cell"
          :class="{ 's3-col__cell--on': mbtiPick[col] === pair[0] }"
          @tap="setMbti(col, pair[0])"
        >
          <text
            class="s3-col__letter ff-yuan"
            :class="{ 's3-col__letter--on': mbtiPick[col] === pair[0] }"
          >
            {{ pair[0] }}
          </text>
        </view>
        <view
          class="s3-col__cell"
          :class="{ 's3-col__cell--on': mbtiPick[col] === pair[1] }"
          @tap="setMbti(col, pair[1])"
        >
          <text
            class="s3-col__letter ff-yuan"
            :class="{ 's3-col__letter--on': mbtiPick[col] === pair[1] }"
          >
            {{ pair[1] }}
          </text>
        </view>
        <text class="s3-col__lab s3-col__lab--bot ff-yuan">{{ mbtiBotLabels[col] }}</text>
      </view>
    </view>

    <!-- Figma 3894:7504：头部+已选+Tab 固定，Rectangle 3274 为标签独立滚动区 -->
    <view v-else-if="step === 2" class="s2-shell" :style="s2ShellStyle">
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
        :style="{ height: s2TagsScrollHpx + 'px' }"
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

    <!-- Figma Rectangle 22 = 底部渐变 232rpx，位于按钮上方 -->
    <view v-if="step === 1" class="wiz-foot wiz-foot--s1">
      <view class="wiz-foot__fade wiz-foot__fade--s1" />
      <view class="wiz-foot__btn" @tap="next1">
        <text class="wiz-foot__btn-tx ff-yuan">下一步</text>
      </view>
    </view>

    <view v-else-if="step === 2" class="wiz-foot wiz-foot--s2">
      <view class="wiz-foot__fade wiz-foot__fade--s2" />
      <view class="wiz-foot__btn" @tap="goToStep3">
        <text class="wiz-foot__btn-tx ff-yuan">下一步</text>
      </view>
      <text class="wiz-foot__skip ff-yuan" @tap="deferTags">暂不设置</text>
    </view>

    <view v-else-if="step === 3" class="wiz-foot wiz-foot--s2">
      <view class="wiz-foot__fade" />
      <view class="wiz-foot__btn" @tap="finishComplete">
        <text class="wiz-foot__btn-tx ff-yuan">完成</text>
      </view>
      <text class="wiz-foot__skip ff-yuan" @tap="finishDeferMbti">暂不设置</text>
    </view>

    <BirthdayPicker
      :visible="showBirth"
      wizard-kind="taker"
      :value="form.birthday"
      @close="showBirth = false"
      @confirm="onBirthConfirm"
    />

    <ChronicDiseasePicker
      :visible="showDiseasePanel"
      :options="diseaseOptions"
      :initial-value="chronicInitialValue"
      @close="showDiseasePanel = false"
      @confirm="onDiseaseConfirm"
    />
  </view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import BirthdayPicker from '@/components/common/BirthdayPicker.vue'
import ChronicDiseasePicker from '@/components/common/ChronicDiseasePicker.vue'
import { deriveBirthFields } from '@/utils/lunar.js'
import { parseCloudError } from '@/utils/cloud-error.js'
import { useMatchingStore } from '@/store/matching'
import { useEnvTagForm } from '@/composables/use-env-tag-form.js'
import { getScrollEndFromBottomRpx, S2_FIXED_TOP_RPX } from '@/utils/wizard-layout.js'

const editId = ref('')
const fromMatching = ref(false)
const fromFiles = ref(false)
const matchMode = ref('multi')
const assignedGiverName = ref('')
const step = ref(1)
const showBirth = ref(false)
const showDiseasePanel = ref(false)
const scrollHpx = ref(500)
const scrollPadTopPx = ref(0)
/** 与底栏（红框区域）等高，滚动区 bottom 贴齐底栏上沿 */
const footBottomPx = ref(0)
/** Step2 下方可选标签滚动区高度（px，layout 内按 S2_FIXED_TOP_RPX 计算） */
const s2TagsScrollHpx = ref(200)
const statusBarPx = ref(20)
const navBarPx = ref(44)
const chronicTouched = ref(false)
const envTab = ref('hobby')

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

const form = reactive({
  name: '',
  gender: 'female',
  birthday: null,
  wuxing: '',
  sixiang: '',
  is_matched: false,
  chronic_disease: ['无'],
  env_tags: {
    hobby: [],
    lifestyle: [],
    personality: [],
    comm_style: []
  },
  mbti: ''
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

const assignGiverLine = computed(() =>
  form.is_matched ? assignedGiverName.value || '—' : '匹配后自动分配'
)

const wizardScrollStyle = computed(() => {
  if (step.value === 2) {
    return { display: 'none' }
  }
  if (step.value < 1 || step.value > 3) {
    return {
      height: `${scrollHpx.value}px`,
      paddingTop: `${scrollPadTopPx.value}px`
    }
  }
  return {
    position: 'fixed',
    left: 0,
    right: 0,
    top: `${scrollPadTopPx.value}px`,
    bottom: `${footBottomPx.value}px`,
    width: '100%',
    boxSizing: 'border-box'
  }
})

const s2ShellStyle = computed(() => ({
  position: 'fixed',
  left: 0,
  right: 0,
  top: `${scrollPadTopPx.value}px`,
  bottom: `${footBottomPx.value}px`,
  width: '100%',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}))

function syncWuxingSixiangFromBirthday() {
  const derived = deriveBirthFields(form.birthday)
  form.wuxing = derived.wuxing
  form.sixiang = derived.sixiang
}

const mbtiPairs = [
  ['E', 'I'],
  ['S', 'N'],
  ['T', 'F'],
  ['J', 'P']
]
const mbtiTopLabels = ['外向', '实感', '理智', '判断']
const mbtiBotLabels = ['内向', '直觉', '情感', '感知']
const mbtiPick = ref(['', '', '', ''])

const progressPct = computed(() => {
  if (step.value === 1) return '33.33%'
  if (step.value === 2) return '66.66%'
  return '100%'
})

const progressBarPct = computed(() => {
  if (step.value === 1) return '33.33%'
  if (step.value === 2) return '66.67%'
  return '100%'
})

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

const chronicFieldText = computed(() => {
  if (!chronicTouched.value) return '请设置慢性病'
  return selectedDiseases.value[0] || '无'
})

const chronicInitialValue = computed(() => {
  if (!chronicTouched.value) return '无'
  return selectedDiseases.value[0] || '无'
})

const chronicHintClass = computed(() =>
  chronicTouched.value ? 's1-val ff-yuan' : 's1-ph ff-yuan'
)

function goBack() {
  if (step.value > 1) {
    step.value -= 1
    layout()
    return
  }
  uni.navigateBack()
}

function openDiseasePanel() {
  showDiseasePanel.value = true
}

function onDiseaseConfirm(val) {
  chronicTouched.value = true
  selectedDiseases.value = [val]
  form.chronic_disease = [val]
  showDiseasePanel.value = false
}

function normalizeChronicString() {
  if (selectedDiseases.value.includes('无')) return '无'
  return selectedDiseases.value.join('，')
}

function unwrapCloud(ret) {
  if (ret && typeof ret === 'object' && ret.result !== undefined) return ret.result
  return ret
}

onLoad((opts) => {
  editId.value = (opts && opts.id) || ''
  fromMatching.value = opts?.from === 'matching'
  fromFiles.value = opts?.from === 'files'
  matchMode.value = opts?.mode === 'single' ? 'single' : 'multi'
})

function layout() {
  const s = uni.getSystemInfoSync()
  const safeBottom = s.safeAreaInsets?.bottom ?? 0
  statusBarPx.value = s.statusBarHeight || 20
  navBarPx.value = uni.upx2px(88)
  if (step.value === 2 || step.value === 3) {
    footBottomPx.value =
      uni.upx2px(getScrollEndFromBottomRpx(2)) + safeBottom
  } else if (step.value === 1) {
    footBottomPx.value =
      uni.upx2px(getScrollEndFromBottomRpx(1)) + safeBottom
  } else {
    footBottomPx.value = 0
  }
  if (step.value >= 1 && step.value <= 3) {
    scrollPadTopPx.value = statusBarPx.value + navBarPx.value + uni.upx2px(6)
  } else {
    scrollPadTopPx.value = uni.upx2px(8)
  }
  scrollHpx.value = Math.max(
    200,
    s.windowHeight - footBottomPx.value - scrollPadTopPx.value
  )
  if (step.value === 2) {
    const fixedTopPx = uni.upx2px(S2_FIXED_TOP_RPX)
    s2TagsScrollHpx.value = Math.max(
      120,
      s.windowHeight - scrollPadTopPx.value - footBottomPx.value - fixedTopPx
    )
  }
}

function goToStep3() {
  step.value = 3
  layout()
}

function deferTags() {
  step.value = 3
  layout()
}

async function hydrate() {
  if (!editId.value) return
  try {
    const tm = uniCloud.importObject('taker-manager')
    const res = await tm.getTakerDetail({ id: editId.value })
    const d = res?.data ?? res?.result?.data
    if (!d) return
    form.name = d.name || ''
    form.gender = d.gender || ''
    form.birthday = d.birthday || null
    form.mbti = d.mbti || ''
    if (d.env_tags && typeof d.env_tags === 'object') {
      applyNormalizedEnvTags(d.env_tags)
    }
    const ch = String(d.chronic_disease ?? '').trim()
    if (ch) {
      const arr = ch.split(/[,，]/).map((x) => x.trim()).filter(Boolean)
      selectedDiseases.value = arr.length ? arr : ['无']
      form.chronic_disease = [...selectedDiseases.value]
      chronicTouched.value = true
    } else {
      selectedDiseases.value = ['无']
      form.chronic_disease = ['无']
    }
    if (form.mbti && form.mbti.length === 4) {
      mbtiPick.value = form.mbti.split('')
    }
    form.is_matched = !!d.is_matched
    assignedGiverName.value =
      String(d.matched_giver_name || d.linked_giver_name || '').trim()
    syncWuxingSixiangFromBirthday()
  } catch (e) {
    uni.showToast({ title: parseCloudError(e), icon: 'none' })
  }
}

onMounted(async () => {
  layout()
  await rulesStore.fetchActiveEnvTags()
  await hydrate()
})

onShow(async () => {
  const changed = await rulesStore.fetchActiveEnvTags()
  if (changed) {
    applyNormalizedEnvTags(form.env_tags)
  }
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
  if (!selectedDiseases.value.length) {
    uni.showToast({ title: '请选择慢性病', icon: 'none' })
    return
  }
  if (!chronicTouched.value) {
    uni.showToast({ title: '请设置慢性病', icon: 'none' })
    return
  }
  step.value = 2
  layout()
}

function skipTags() {
  step.value = 3
  layout()
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
  const { year, month, day } = form.birthday.solar
  const { wuxing, sixiang, constellation } = deriveBirthFields(form.birthday)
  const age = new Date().getFullYear() - year

  const payload = {
    name: String(form.name || '').trim(),
    gender: form.gender,
    birthday: form.birthday,
    age,
    wuxing,
    sixiang,
    constellation,
    mbti: mbtiStr || '',
    env_tags: {
      hobby: [...(form.env_tags.hobby || [])],
      lifestyle: [...(form.env_tags.lifestyle || [])],
      personality: [...(form.env_tags.personality || [])],
      comm_style: [...(form.env_tags.comm_style || [])]
    },
    chronic_disease: normalizeChronicString()
  }

  uni.showLoading({ title: '保存中...', mask: true })
  try {
    const tm = uniCloud.importObject('taker-manager')
    let saved = editId.value
    if (editId.value) {
      await tm.updateTaker({ id: editId.value, ...payload })
    } else {
      const raw = await tm.addTaker({
        ...payload,
        assigned_giver_id: '',
        status: 'active'
      })
      const out = unwrapCloud(raw)
      saved = out?.data?.id || out?.id
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    const id = saved || editId.value
    setTimeout(async () => {
      if (fromFiles.value && !editId.value && id) {
        uni.navigateBack()
        return
      }
      if (fromMatching.value && !editId.value && id) {
        try {
          const matchingStore = useMatchingStore()
          matchingStore.setMatchMode(matchMode.value)
          const detailRes = await tm.getTakerDetail({ id })
          const doc = detailRes?.data ?? detailRes?.result?.data
          if (doc) {
            matchingStore.setSelectedTaker(doc)
          } else {
            matchingStore.setSelectedTaker({ _id: id, name: payload.name })
          }
        } catch (_) {
          const matchingStore = useMatchingStore()
          matchingStore.setMatchMode(matchMode.value)
          matchingStore.setSelectedTaker({ _id: id, name: payload.name })
        }
        uni.navigateBack()
        return
      }
      uni.redirectTo({ url: `/pages/taker/detail?id=${id}` })
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

$match-purple: #9245f9;
$match-purple-light: #c766ff;
$page-light: #faf6ff;
$page-deep: #eadaff;

.page {
  min-height: 100vh;
  background: $color-bg;
  box-sizing: border-box;
}

.page--wizard {
  background: linear-gradient(180deg, $page-light 0%, $page-deep 100%);
}

/* —— Figma 3894:7438 / 3894:7504 向导导航 —— */
.wiz-nav {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  background: transparent;
}

.wiz-nav__bar {
  position: relative;
}

.wiz-nav__back {
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

.wiz-nav__back-ico {
  width: 24rpx;
  height: 48rpx;
}

.wiz-nav__skip {
  position: absolute;
  right: 32rpx;
  top: 50%;
  transform: translateY(-50%);
  font-size: 28rpx;
  font-weight: 400;
  color: $match-purple;
  line-height: normal;
}

.wiz-progress {
  height: 6rpx;
  margin: 0;
  background: #f6eeff;
  border-radius: 40rpx;
  overflow: hidden;
}

.wiz-progress__fill {
  height: 100%;
  background: $match-purple;
  border-radius: 40rpx;
  transition: width 0.2s ease;
}

.scroll--s1 {
  padding: 0 44rpx 48rpx;
  box-sizing: border-box;
}

.s1-head {
  padding: 28rpx 0 0;
  margin-bottom: 48rpx;
}

.s1-banner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.s1-banner__ico {
  width: 164rpx;
  height: 164rpx;
  flex-shrink: 0;
}

.s1-banner__ttl {
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #31233a;
  line-height: normal;
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

.s1-field__chev {
  width: 44rpx;
  height: 44rpx;
  flex-shrink: 0;
  margin-left: 16rpx;
  display: block;
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

.s1-foot,
.wiz-foot {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  pointer-events: none;
}

/* 滚动区底距屏底 116；Rectangle 22 渐变叠在滚动区与按钮之间 */
.wiz-foot--s1 {
  height: calc(348rpx + env(safe-area-inset-bottom));
}

.s1-foot__fade,
.wiz-foot__fade {
  height: 232rpx;
  background: linear-gradient(
    180deg,
    rgba(240, 232, 251, 0) 0%,
    #f0e8fb 23.45%,
    #f0e8fb 100%
  );
}

.wiz-foot--s1 .wiz-foot__fade--s1 {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(116rpx + env(safe-area-inset-bottom));
  height: 232rpx;
}

.s1-foot__btn,
.wiz-foot__btn {
  position: absolute;
  left: 30rpx;
  right: 30rpx;
  bottom: calc(48rpx + env(safe-area-inset-bottom));
  height: 92rpx;
  border-radius: 100rpx;
  background: linear-gradient(47.18deg, $match-purple-light 11.9%, $match-purple 94.02%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
}

.s1-foot__btn-tx,
.wiz-foot__btn-tx {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: normal;
}

.wiz-foot--s2 {
  height: calc(348rpx + env(safe-area-inset-bottom));
}

.wiz-foot--s2 .wiz-foot__fade--s2 {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(116rpx + env(safe-area-inset-bottom));
  height: 232rpx;
}

.wiz-foot--s2 .wiz-foot__btn {
  left: 30rpx;
  right: 30rpx;
  bottom: calc(76rpx + env(safe-area-inset-bottom));
}

.wiz-foot__skip {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(24rpx + env(safe-area-inset-bottom));
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
  text-align: center;
  line-height: normal;
  pointer-events: auto;
}

/* —— Figma 3894:7504 Step 2 —— */
.s2-shell {
  display: flex;
  flex-direction: column;
  background: transparent;
  overflow: hidden;
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

.s2-tags-hint {
  padding: 24rpx 0;
  font-size: 28rpx;
  color: $color-text-secondary;
  text-align: center;
}

.s2-sub {
  display: block;
  margin-top: 8rpx;
  font-size: 20rpx;
  font-weight: 400;
  color: #8d7a99;
  line-height: normal;
}

/* Figma Rectangle 3274：已选标签白卡，固定高 400 */
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
  font-weight: 600;
  color: #31233a;
}

.s2-tabs__line {
  margin-top: 12rpx;
  width: 56rpx;
  height: 4rpx;
  border-radius: 4rpx;
  background: $match-purple;
}

.s2-tabs-divider {
  height: 1rpx;
  margin-top: 16rpx;
  background: rgba(0, 0, 0, 0.08);
}

/* 四维 Tab 下方可选标签区：底边距屏底 116，内部 scroll-view 纵向滚动 */
.s2-tags-scroll {
  flex: 1;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
}

.s2-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 32rpx 34rpx 24rpx;
  box-sizing: border-box;
}

.s2-tag {
  height: 68rpx;
  padding: 0 28rpx;
  border-radius: 40rpx;
  background: #faf6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.s2-tag--on {
  background: #c091ff;
}

.s2-tag__tx {
  font-size: 26rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: normal;
  white-space: nowrap;
}

.s2-tag--on .s2-tag__tx {
  color: #ffffff;
}

/* —— Figma 3894:7566 Step 3 —— */
.scroll--s3 {
  padding: 0;
  box-sizing: border-box;
}

.s3-head {
  position: relative;
  padding: 28rpx 44rpx 0;
}

.s3-skip {
  position: absolute;
  right: 44rpx;
  top: 28rpx;
  font-size: 28rpx;
  font-weight: 400;
  color: $match-purple;
  line-height: normal;
  z-index: 2;
}

.s3-banner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding-right: 120rpx;
  box-sizing: border-box;
}

.s3-banner__ico {
  width: 164rpx;
  height: 164rpx;
  flex-shrink: 0;
}

.s3-banner__ttl {
  margin-top: 8rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #31233a;
  line-height: normal;
}

/* 底行「内向/直觉/情感/感知」文字底边距屏底 600 */
.s3-grid {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 600rpx;
  z-index: 20;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 0 54rpx;
  box-sizing: border-box;
  pointer-events: auto;
}

.s3-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100rpx;
}

.s3-col__lab {
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: normal;
  white-space: nowrap;
}

.s3-col__lab:first-child {
  margin-bottom: 24rpx;
}

.s3-col__lab--bot {
  margin-top: 24rpx;
}

.s3-col__cell {
  width: 100rpx;
  height: 100rpx;
  border-radius: 62rpx;
  background: #ffffff;
  border: 4rpx solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}

.s3-col__cell:last-of-type {
  margin-bottom: 0;
}

.s3-col__cell--on {
  border-color: $match-purple;
}

.s3-col__letter {
  font-size: 32rpx;
  font-weight: 400;
  color: #8d7a99;
  line-height: normal;
}

.s3-col__letter--on {
  color: $match-purple;
}

.form-item-assign {
  margin-top: 8rpx;
}

.assign-hint {
  display: block;
  color: #999;
  font-size: 28rpx;
  line-height: 1.5;
}

/* —— Step 2/3 —— */
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

.h1 {
  font-size: 36rpx;
  font-weight: 600;
  color: $color-text-primary;
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
