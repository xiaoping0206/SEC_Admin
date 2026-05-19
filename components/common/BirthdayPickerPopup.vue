<template>
  <view v-if="shown" class="mask" @tap="emit('close')">
    <view class="sheet" @tap.stop>
      <text class="sheet__title ff-yuan">设置生日</text>
      <view class="sheet__divider" />

      <view class="sheet__tabs">
        <view
          class="sheet__tab"
          :class="{ 'sheet__tab--on': calIdx === 0 }"
          @tap="switchCal(0)"
        >
          <text class="sheet__tab-tx ff-yuan">阳历</text>
        </view>
        <view
          class="sheet__tab"
          :class="{ 'sheet__tab--on': calIdx === 1 }"
          @tap="switchCal(1)"
        >
          <text class="sheet__tab-tx ff-yuan">农历</text>
        </view>
      </view>

      <view class="sheet__picker-wrap">
        <view class="sheet__shade sheet__shade--top" />
        <view class="sheet__shade sheet__shade--bottom" />
        <view class="sheet__indicator" />

        <picker-view
          v-if="calIdx === 0"
          class="sheet__pv"
          :value="solarPvValue"
          indicator-style="height: 120rpx"
          @change="onSolarPv"
        >
          <picker-view-column>
            <view v-for="(y, i) in solarYearList" :key="'sy-' + i" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ y }}年</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in monthNums12" :key="'sm-' + m" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ m }}月</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="d in solarDayNums" :key="'sd-' + d" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ d }}日</text>
            </view>
          </picker-view-column>
        </picker-view>

        <picker-view
          v-else
          class="sheet__pv"
          :value="lunarPvValue"
          indicator-style="height: 120rpx"
          @change="onLunarPv"
        >
          <picker-view-column>
            <view v-for="(y, i) in lunarYearList" :key="'ly-' + i" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ y }}年</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(row, j) in lunarMonthRows" :key="'lm-' + j" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ row.label }}</text>
            </view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="(lab, k) in lunarDayLabelsCol" :key="'ld-' + k" class="sheet__pv-row">
              <text class="sheet__pv-tx ff-yuan">{{ lab }}</text>
            </view>
          </picker-view-column>
        </picker-view>
      </view>

      <view class="sheet__btn" @tap="onConfirm">
        <text class="sheet__btn-tx ff-yuan">确定</text>
      </view>
    </view>
  </view>
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
  solarId.value = 3
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
  if (y != null && m != null && d != null && calIdx.value === 1) {
    syncLunarPickFromSolarNumbers(y, m, d)
  }
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
$match-purple: #9245f9;
$match-purple-light: #c766ff;

/* Figma 3588:8048 设置生日 */
.mask {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
}

.sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 760rpx;
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  box-sizing: border-box;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.sheet__title {
  display: block;
  padding-top: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #31233a;
  text-align: center;
  line-height: normal;
}

.sheet__divider {
  height: 1rpx;
  margin-top: 32rpx;
  background: rgba(0, 0, 0, 0.08);
}

.sheet__tabs {
  display: flex;
  flex-direction: row;
  gap: 24rpx;
  padding: 24rpx 44rpx 0;
  box-sizing: border-box;
}

.sheet__tab {
  flex: 1;
  height: 72rpx;
  border-radius: 100rpx;
  background: #f6eeff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 2rpx solid transparent;
}

.sheet__tab--on {
  background: #ffffff;
  border-color: $match-purple;
}

.sheet__tab-tx {
  font-size: 28rpx;
  font-weight: 500;
  color: #8d7a99;
  line-height: normal;
}

.sheet__tab--on .sheet__tab-tx {
  font-weight: 700;
  color: $match-purple;
}

.sheet__picker-wrap {
  position: relative;
  height: 360rpx;
  margin-top: 8rpx;
}

.sheet__pv {
  height: 360rpx;
  width: 100%;
}

.sheet__pv-row {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120rpx;
}

.sheet__pv-tx {
  font-size: 32rpx;
  font-weight: 400;
  color: #31233a;
  line-height: normal;
}

.sheet__indicator {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  height: 120rpx;
  pointer-events: none;
  z-index: 2;
  border-top: 1rpx solid rgba(0, 0, 0, 0.08);
  border-bottom: 1rpx solid rgba(0, 0, 0, 0.08);
}

.sheet__shade {
  position: absolute;
  left: 0;
  right: 0;
  height: 120rpx;
  pointer-events: none;
  z-index: 3;
}

.sheet__shade--top {
  top: 50%;
  transform: translateY(-180rpx);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.sheet__shade--bottom {
  top: 50%;
  transform: translateY(60rpx);
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0) 100%);
}

.sheet__btn {
  margin: 16rpx 60rpx 0;
  height: 92rpx;
  border-radius: 100rpx;
  background: linear-gradient(47.18deg, $match-purple-light 11.9%, $match-purple 94.02%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sheet__btn-tx {
  font-size: 32rpx;
  font-weight: 700;
  color: #ffffff;
  line-height: normal;
}
</style>
