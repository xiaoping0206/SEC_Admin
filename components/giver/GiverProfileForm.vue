<template>
  <view class="form">
    <!-- Basic Info -->
    <view class="section-title">基本信息</view>
    <view class="form-item">
      <text class="label">姓名 <text class="required">*</text></text>
      <input v-model="form.name" placeholder="请输入姓名" />
    </view>
    <view class="form-item">
      <text class="label">年龄</text>
      <input v-model.number="form.age" type="number" placeholder="请输入年龄" />
    </view>
    <view class="form-item">
      <text class="label">性别</text>
      <radio-group @change="e => form.gender = e.detail.value">
        <radio value="male" :checked="form.gender === 'male'">男</radio>
        <radio value="female" :checked="form.gender === 'female'">女</radio>
      </radio-group>
    </view>
    <view class="form-item">
      <text class="label">资质证书</text>
      <input v-model="form.qualification" placeholder="如：初级护理员" />
    </view>
    <view class="form-item">
      <text class="label">工作年限</text>
      <input v-model.number="form.experience_years" type="number" placeholder="年" />
    </view>
    <view class="form-item">
      <text class="label">最大可接人数（上限 5 人）</text>
      <slider
        :value="form.max_taker_count"
        min="1"
        max="5"
        step="1"
        show-value
        @change="onMaxTakerChange"
      />
    </view>

    <!-- Personality -->
    <view class="section-title">性格特征</view>
    <view class="form-item">
      <text class="label">五行</text>
      <picker :range="WUXING_OPTIONS" @change="e => form.wuxing = WUXING_OPTIONS[e.detail.value]">
        <view class="picker-value">{{ form.wuxing || '请选择' }}</view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">四象</text>
      <picker :range="SIXIANG_OPTIONS" @change="e => form.sixiang = SIXIANG_OPTIONS[e.detail.value]">
        <view class="picker-value">{{ form.sixiang || '请选择' }}</view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">MBTI</text>
      <picker :range="MBTI_OPTIONS" @change="e => form.mbti = MBTI_OPTIONS[e.detail.value]">
        <view class="picker-value">{{ form.mbti || '请选择' }}</view>
      </picker>
    </view>

    <button class="btn-submit" :disabled="!canSubmit || loading" @tap="onSubmit">
      {{ loading ? '保存中…' : '保存' }}
    </button>
  </view>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'

const WUXING_OPTIONS  = ['water', 'wood', 'fire', 'earth', 'metal']
const SIXIANG_OPTIONS = ['fire', 'earth', 'air', 'water']
const MBTI_OPTIONS    = ['ENFJ','ENFP','ENTJ','ENTP','ESFJ','ESFP','ESTJ','ESTP',
                          'INFJ','INFP','INTJ','INTP','ISFJ','ISFP','ISTJ','ISTP']

const props = defineProps({
  initial: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: '', age: null, gender: 'male', qualification: '',
  experience_years: 0, available_areas: [],
  wuxing: '', sixiang: '', mbti: '',
  env_tags: { hobby: [], lifestyle: [], personality: [], comm_style: [] },
  max_taker_count: 5
})

watch(() => props.initial, (val) => {
  if (val) Object.assign(form, val)
}, { immediate: true })

const canSubmit = computed(() => form.name.trim().length > 0)

function onMaxTakerChange(e) {
  const v = e?.detail?.value
  form.max_taker_count = typeof v === 'number' ? v : Number(v)
}

function onSubmit() {
  if (!canSubmit.value) return
  emit('submit', { ...form })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.form { padding-bottom: $spacing-2xl; }

.section-title {
  font-size: $font-size-sm;
  font-weight: $font-weight-bold;
  color: $color-text-secondary;
  margin: $spacing-lg 0 $spacing-sm;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-item {
  background: $color-surface;
  border-radius: $radius-md;
  padding: $spacing-md;
  margin-bottom: $spacing-sm;

  .label {
    font-size: $font-size-sm;
    color: $color-text-secondary;
    margin-bottom: $spacing-xs;
    display: block;
  }

  .required { color: $color-error; }

  input {
    font-size: $font-size-base;
    color: $color-text-primary;
    width: 100%;
  }

  .picker-value {
    font-size: $font-size-base;
    color: $color-text-primary;
    padding: $spacing-xs 0;
  }
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  background: $color-secondary;
  color: #fff;
  border-radius: $radius-full;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  margin-top: $spacing-lg;

  &[disabled] { background: $color-text-disabled; }
}
</style>
