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
      <text class="label">联系方式</text>
      <input v-model="form.contact" placeholder="手机号码" />
    </view>
    <view class="form-item">
      <text class="label">护理等级（1~5）</text>
      <slider
        :value="form.care_level"
        min="1"
        max="5"
        step="1"
        show-value
        @change="onCareLevelChange"
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

    <!-- Notes -->
    <view class="section-title">备注</view>
    <view class="form-item">
      <textarea v-model="form.notes" placeholder="其他需要说明的情况…" :maxlength="500" />
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
  name: '', age: null, gender: 'male', contact: '',
  care_level: 1, wuxing: '', sixiang: '', mbti: '',
  env_tags: { hobby: [], lifestyle: [], personality: [], comm_style: [] },
  notes: ''
})

watch(() => props.initial, (val) => {
  if (val) Object.assign(form, val)
}, { immediate: true })

const canSubmit = computed(() => form.name.trim().length > 0)

function onCareLevelChange(e) {
  const v = e?.detail?.value
  form.care_level = typeof v === 'number' ? v : Number(v)
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

  input, textarea {
    font-size: $font-size-base;
    color: $color-text-primary;
    width: 100%;
  }

  textarea { height: 180rpx; }

  .picker-value {
    font-size: $font-size-base;
    color: $color-text-primary;
    padding: $spacing-xs 0;
  }
}

.btn-submit {
  width: 100%;
  height: 88rpx;
  background: $color-primary;
  color: #fff;
  border-radius: $radius-full;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  margin-top: $spacing-lg;

  &[disabled] { background: $color-text-disabled; }
}
</style>
