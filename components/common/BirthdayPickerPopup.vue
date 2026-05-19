<template>
  <u-popup
    :show="shown"
    mode="bottom"
    round="24rpx"
    :safe-area-inset-bottom="true"
    @close="emit('close')"
  >
    <view class="popup">
      <view class="popup__hdr">
        <text class="popup__tit">设置生日</text>
        <text class="popup__close" @tap="emit('close')">×</text>
      </view>

      <view class="tabs">
        <text
          class="tabs__cell"
          :class="{ 'tabs__cell--on': calIdx === 0 }"
          @tap="switchCal(0)"
        >
          阳历
        </text>
        <text
          class="tabs__cell"
          :class="{ 'tabs__cell--on': calIdx === 1 }"
          @tap="switchCal(1)"
        >
          农历
        </text>
      </view>

      <picker-view
        v-if="calIdx === 0"
        class="pv"
        :value="solarPvValue"
        indicator-style="height: 44px"
        @change="onSolarPv"
      >
        <picker-view-column>
          <view v-for="(y, i) in solarYearList" :key="'sy-' + i" class="pv__row">
            <text class="pv__txt">{{ y }}年</text>
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="m in monthNums12" :key="'sm-' + m" class="pv__row">
            <text class="pv__txt">{{ m }}月</text>
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="d in solarDayNums" :key="'sd-' + d" class="pv__row">
            <text class="pv__txt">{{ d }}日</text>
          </view>
        </picker-view-column>
      </picker-view>

      <picker-view
        v-else
        class="pv"
        :value="lunarPvValue"
        indicator-style="height: 44px"
        @change="onLunarPv"
      >
        <picker-view-column>
          <view v-for="(y, i) in lunarYearList" :key="'ly-' + i" class="pv__row">
            <text class="pv__txt">{{ y }}年</text>
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="(row, j) in lunarMonthRows" :key="'lm-' + j" class="pv__row">
            <text class="pv__txt">{{ row.label }}</text>
          </view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="(lab, k) in lunarDayLabelsCol" :key="'ld-' + k" class="pv__row">
            <text class="pv__txt">{{ lab }}</text>
          </view>
        </picker-view-column>
      </picker-view>

      <view class="popup__foot">
        <button class="btn-ok" @tap="onConfirm">确定</button>
      </view>
    </view>
  </u-popup>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  birthYearBounds,
  numberRangeInclusive,
  solarDaysInMonth,
  buildLunarMonthRows,
  lunarDaysInSlot,
  lunarDayLabel,
  solarToLunar,
  lunarToSolar
} from '@/utils/lunar.js'

const monthNums12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const props = defineProps({
  shown: { type: Boolean, default: false },
  /** @type {'taker'|'giver'} */
  wizardKind: { type: String, default: 'taker' },
  /** 已有档案：用于回填 */
  initialBirthday: { type: Object, default: null }
})

const emit = defineEmits(['close', 'confirm'])

const calIdx = ref(0)

const solarYearList = computed(() => {
  const { minYear, maxYear } = birthYearBounds(props.wizardKind)
  return numberRangeInclusive(minYear, maxYear)
})

const lunarYearList = computed(() => solarYearList.value)

const solarIy = ref(0)
const solarIm = ref(0)
const solarId = ref(0)

const lunarIy = ref(0)
const lunarMm = ref(0)
const lunarDd = ref(0)

function defaultIndices() {
  const { minYear, maxYear } = birthYearBounds(props.wizardKind)
  const midY = Math.floor((minYear + maxYear) / 2)
  solarIy.value = midY - minYear
  solarIm.value = 5
  solarId.value = 14
}

function applyFromStored(b) {
  if (!b || typeof b !== 'object') {
    defaultIndices()
    return
  }
  const y = b.solar ? b.solar.year : null
  const m = b.solar ? b.solar.month : null
  const d = b.solar ? b.solar.day : null
  if (y != null && m != null && d != null) {
    const yi = solarYearList.value.indexOf(y)
    solarIy.value = yi >= 0 ? yi : 0
    solarIm.value = Math.max(0, Math.min(11, m - 1))
    const maxD = solarDaysInMonth(y, m)
    solarId.value = Math.max(0, Math.min(maxD - 1, d - 1))
  } else {
    defaultIndices()
  }

  if (b.type === 'lunar' && b.lunar?.year != null && b.lunar.month != null && b.lunar.day != null) {
    calIdx.value = 1
    const ly = b.lunar.year
    lunarIy.value = Math.max(0, lunarYearList.value.indexOf(ly))
    const rows = buildLunarMonthRows(ly)
    const idx = rows.findIndex(
      (r) => r.lunarMonth === b.lunar.month && !!r.isLeap === !!b.lunar.isLeap
    )
    lunarMm.value = idx >= 0 ? idx : 0
    const row = rows[lunarMm.value]
    const maxDd = row ? lunarDaysInSlot(ly, row.lunarMonth, row.isLeap) : b.lunar.day
    lunarDd.value = Math.max(0, Math.min(b.lunar.day, maxDd) - 1)
    return
  }

  calIdx.value = b.type === 'lunar' ? 1 : 0
  if (y != null && m != null && d != null && calIdx.value === 1) syncLunarPickFromSolarNumbers(y, m, d)
}

watch(
  () => props.shown,
  (v) => {
    if (v) applyFromStored(props.initialBirthday)
  }
)

watch([() => props.wizardKind, () => props.initialBirthday], () => {
  if (props.shown) applyFromStored(props.initialBirthday)
})

const solarDayNums = computed(() => {
  const y = solarYearList.value[solarIy.value]
  const m = solarIm.value + 1
  const n = solarDaysInMonth(y, m)
  return numberRangeInclusive(1, n)
})

watch([solarIy, solarIm], () => {
  const maxIdx = solarDayNums.value.length - 1
  if (solarId.value > maxIdx) solarId.value = maxIdx
})

const solarPvValue = computed(() => [solarIy.value, solarIm.value, solarId.value])

function onSolarPv(e) {
  const v = e.detail.value
  solarIy.value = v[0]
  solarIm.value = v[1]
  solarId.value = v[2]
}

const lunarMonthRows = computed(() => {
  const ly = lunarYearList.value[lunarIy.value]
  return buildLunarMonthRows(ly)
})

watch([lunarIy], () => {
  lunarMm.value = Math.min(lunarMm.value, lunarMonthRows.value.length - 1)
})

watch(lunarMonthRows, (rows) => {
  if (lunarMm.value >= rows.length) lunarMm.value = Math.max(0, rows.length - 1)
})

watch([lunarMonthRows, lunarIy, lunarMm], () => {
  const maxDd = lunarDayCount.value - 1
  if (lunarDd.value > maxDd) lunarDd.value = Math.max(0, maxDd)
})

const lunarDayCount = computed(() => {
  const ly = lunarYearList.value[lunarIy.value]
  const rows = lunarMonthRows.value
  const row = rows[lunarMm.value]
  if (!row) return 29
  return lunarDaysInSlot(ly, row.lunarMonth, row.isLeap)
})

const lunarDayLabelsCol = computed(() => {
  const n = lunarDayCount.value
  const out = []
  for (let d = 1; d <= n; d++) out.push(lunarDayLabel(d))
  return out
})

const lunarPvValue = computed(() => [lunarIy.value, lunarMm.value, lunarDd.value])

function onLunarPv(e) {
  const v = e.detail.value
  lunarIy.value = v[0]
  lunarMm.value = v[1]
  lunarDd.value = v[2]
}

function syncLunarPickFromSolarNumbers(year, month, day) {
  const sl = solarToLunar(year, month, day)
  if (!sl) return
  let yi = lunarYearList.value.indexOf(sl.lunarYear)
  if (yi < 0) yi = lunarYearList.value.indexOf(year)
  if (yi < 0) yi = 0
  lunarIy.value = yi

  const ly = lunarYearList.value[lunarIy.value]
  const rows = buildLunarMonthRows(ly)
  const idx = rows.findIndex(
    (r) => r.lunarMonth === sl.lunarMonth && r.isLeap === !!sl.isLeap
  )
  lunarMm.value = idx >= 0 ? idx : 0
  const row = rows[lunarMm.value]
  const maxDd = row ? lunarDaysInSlot(ly, row.lunarMonth, row.isLeap) : sl.lunarDay
  lunarDd.value = Math.max(0, Math.min(sl.lunarDay, maxDd) - 1)
}

function switchCal(i) {
  calIdx.value = i
  if (i === 1) {
    const y = solarYearList.value[solarIy.value]
    const mo = solarIm.value + 1
    const dd = solarId.value + 1
    syncLunarPickFromSolarNumbers(y, mo, dd)
  }
}

function onConfirm() {
  if (calIdx.value === 0) {
    const y = solarYearList.value[solarIy.value]
    const mo = solarIm.value + 1
    const d = solarId.value + 1
    const ts = new Date(y, mo - 1, d).getTime()
    const lu = solarToLunar(y, mo, d)
    emit('confirm', {
      solar: { year: y, month: mo, day: d },
      lunar: lu
        ? {
            year: lu.lunarYear,
            month: lu.lunarMonth,
            day: lu.lunarDay,
            isLeap: !!lu.isLeap
          }
        : {
            year: y,
            month: mo,
            day: d,
            isLeap: false
          },
      type: 'solar',
      timestamp: ts
    })
    return
  }

  const ly = lunarYearList.value[lunarIy.value]
  const rows = lunarMonthRows.value
  const row = rows[lunarMm.value]
  if (!row) {
    uni.showToast({ title: '请选择农历年月', icon: 'none' })
    return
  }
  const d = lunarDd.value + 1
  const solar = lunarToSolar(ly, row.lunarMonth, d, row.isLeap)
  if (!solar) {
    uni.showToast({ title: '农历日期无效', icon: 'none' })
    return
  }
  const ts = new Date(solar.year, solar.month - 1, solar.day).getTime()
  emit('confirm', {
    solar: {
      year: solar.year,
      month: solar.month,
      day: solar.day
    },
    lunar: {
      year: ly,
      month: row.lunarMonth,
      day: d,
      isLeap: !!row.isLeap
    },
    type: 'lunar',
    timestamp: ts
  })
}
</script>

<style lang="scss" scoped>
@import '@/styles/variables.scss';

.popup {
  padding: 24rpx 24rpx 32rpx;
  padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
  box-sizing: border-box;
}

.popup__hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.popup__tit {
  font-size: $font-size-lg;
  color: $color-text-primary;
  font-weight: 600;
}

.popup__close {
  font-size: 48rpx;
  color: $color-text-secondary;
  line-height: 1;
}

.tabs {
  display: flex;
  flex-direction: row;
  border-bottom: 1rpx solid $color-border;
  margin-bottom: 12rpx;
}

.tabs__cell {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: $font-size-base;
  color: $color-text-secondary;
}

.tabs__cell--on {
  color: #4a90e2;
  border-bottom: 4rpx solid #4a90e2;
}

.pv {
  height: 420rpx;
  width: 100%;
}

.pv__row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 44px;
}

.pv__txt {
  font-size: $font-size-base;
  color: $color-text-primary;
}

.popup__foot {
  margin-top: 16rpx;
}

.btn-ok {
  height: 88rpx;
  line-height: 88rpx;
  border-radius: 44rpx;
  background: #4a90e2;
  color: #ffffff;
  font-size: $font-size-base;

  &::after {
    border: none;
  }
}
</style>
