/**
 * 阳历/农历及生日推导（日干五行、星座四象）
 * 农历互转源自 jjonline/calendar.js（经 uView Plus 内置精简），见下文引用。
 */

import CalendarModule from 'uview-plus/libs/util/calendar.js'

const Calendar = CalendarModule.default || CalendarModule

const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

const GAN_IDX = {
  甲: 0,
  乙: 1,
  丙: 2,
  丁: 3,
  戊: 4,
  己: 5,
  庚: 6,
  辛: 7,
  壬: 8,
  癸: 9
}

const WUXING_BY_GAN = {
  0: 'wood',
  1: 'wood',
  2: 'fire',
  3: 'fire',
  4: 'earth',
  5: 'earth',
  6: 'metal',
  7: 'metal',
  8: 'water',
  9: 'water'
}

const WUXING_ZH = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水'
}

/**
 * 阳历 → 农历
 * @returns {
 *   lunarYear, lunarMonth, lunarDay, isLeap,
 *   heavenlyStem, earthlyBranch, gzDayFull
 * }
 */
export function solarToLunar(year, month, day) {
  const r = Calendar.solar2lunar(year, month, day)
  if (!r || r === -1) return null

  let stem = ''
  let branch = ''
  const gzDay = typeof r.gzDay === 'string' ? r.gzDay : ''
  if (gzDay.length >= 2) {
    stem = gzDay[0]
    branch = gzDay[1]
  }

  return {
    lunarYear: r.lYear,
    lunarMonth: r.lMonth,
    lunarDay: r.lDay,
    isLeap: !!r.isLeap,
    heavenlyStem: stem || '',
    earthlyBranch: branch || '',
    gzDayFull: gzDay
  }
}

/**
 * 农历 → 阳历（再通过库转回阳历字段）
 */
export function lunarToSolar(lunarYear, lunarMonth, lunarDay, isLeap = false) {
  const out = Calendar.lunar2solar(lunarYear, lunarMonth, lunarDay, !!isLeap)
  if (!out || out === -1) return null
  return {
    year: out.cYear,
    month: out.cMonth,
    day: out.cDay
  }
}

/**
 * 根据阳历日期对应的农历日柱天干（日干）映射五行
 */
export function calcWuxingFromLunarDayStem(year, month, day) {
  const lunar = solarToLunar(year, month, day)
  if (lunar?.heavenlyStem && GAN_IDX[lunar.heavenlyStem] != null) {
    const ganIdx = GAN_IDX[lunar.heavenlyStem]
    const wx = WUXING_BY_GAN[ganIdx]
    return {
      heavenlyDay: lunar.heavenlyStem,
      heavenlyStem: lunar.heavenlyStem,
      wuxing: wx,
      wuxingZh: WUXING_ZH[wx] || ''
    }
  }
  return calcWuxingFromBirthday(year, month, day)
}

/**
 * 生日对象 → 五行（农历日干）+ 星座/四象（阳历月日）
 */
export function deriveBirthFields(birthday) {
  if (!birthday?.solar?.year) {
    return { wuxing: '', sixiang: '', constellation: '' }
  }
  const { year, month, day } = birthday.solar
  const { wuxing } = calcWuxingFromLunarDayStem(year, month, day)
  const { sixiang, constellation } = calcSixiangFromBirthday(month, day)
  return { wuxing, sixiang, constellation }
}

/**
 * 日干五行（基准：1900-01-01 为天干「甲」，序号 0）
 * @deprecated 优先使用 calcWuxingFromLunarDayStem
 */
export function calcWuxingFromBirthday(year, month, day) {
  const baseUtc = Date.UTC(1900, 0, 1)
  const utc = Date.UTC(year, month - 1, day)
  const diffDays = Math.round((utc - baseUtc) / 86400000)
  const ganIdx = ((diffDays % 10) + 10) % 10
  const heavenlyDay = GAN[ganIdx]
  const wx = WUXING_BY_GAN[ganIdx]
  return {
    heavenlyDay,
    heavenlyStem: heavenlyDay,
    wuxing: wx,
    wuxingZh: WUXING_ZH[wx] || ''
  }
}

const ZOD_SIX = [
  { names: ['白羊座', '狮子座', '射手座'], sx: 'fire', sxZh: '火象' },
  { names: ['金牛座', '处女座', '摩羯座'], sx: 'earth', sxZh: '土象' },
  { names: ['双子座', '天秤座', '水瓶座'], sx: 'air', sxZh: '气象' },
  { names: ['巨蟹座', '天蝎座', '双鱼座'], sx: 'water', sxZh: '水象' }
]

/** 阳历月（1–12）、日 → 星座名 */
function constellationOf(month, day) {
  const md = month * 100 + day

  if (md >= 321 && md <= 419) return '白羊座'
  if (md >= 420 && md <= 520) return '金牛座'
  if (md >= 521 && md <= 621) return '双子座'
  if (md >= 622 && md <= 722) return '巨蟹座'
  if (md >= 723 && md <= 822) return '狮子座'
  if (md >= 823 && md <= 922) return '处女座'
  if (md >= 923 && md <= 1023) return '天秤座'
  if (md >= 1024 && md <= 1122) return '天蝎座'
  if (md >= 1123 && md <= 1221) return '射手座'
  if (md >= 1222 || md <= 119) return '摩羯座'
  if (md >= 120 && md <= 218) return '水瓶座'
  if (md >= 219 && md <= 320) return '双鱼座'
  return '白羊座'
}

/**
 * 阳历月日 → 星座 + 四象
 */
export function calcSixiangFromBirthday(month, day) {
  const constellation = constellationOf(month, day)
  let sixiang = 'fire'
  let sixiangZh = '火象'

  const group = ZOD_SIX.find((g) => g.names.includes(constellation))
  if (group) {
    sixiang = group.sx
    sixiangZh = group.sxZh
  }

  return { constellation, sixiang, sixiangZh }
}

const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊']

const LUNAR_DAY_NAMES = (() => {
  const zh = ['初', '十', '廿', '卅']
  const num = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
  const labels = []
  for (let d = 1; d <= 30; d++) {
    if (d <= 10) labels.push(`${d === 10 ? '初十' : '初' + num[d - 1]}`)
    else if (d < 20) labels.push('十' + num[d - 11])
    else if (d === 20) labels.push('二十')
    else if (d < 30) labels.push('廿' + num[d - 21])
    else labels.push(d === 30 ? '三十' : '廿' + num[d - 21])
  }
  return labels
})()

/** 阴历某年可用的月份列表（正月…腊月 + 可能的闰某月）；用于 picker */
export function buildLunarMonthRows(lunarYear) {
  const leap = Calendar.leapMonth(lunarYear)
  const rows = []
  for (let m = 1; m <= 12; m++) {
    rows.push({
      lunarMonth: m,
      isLeap: false,
      label: `${LUNAR_MONTH_NAMES[m - 1]}月`
    })
    if (leap > 0 && leap === m) {
      rows.push({
        lunarMonth: m,
        isLeap: true,
        label: `闰${LUNAR_MONTH_NAMES[m - 1]}月`
      })
    }
  }
  return rows
}

/** 农历某农历月天数（闰月时用 leapDays） */
export function lunarDaysInSlot(lunarYear, lunarMonth, isLeapMonth) {
  if (isLeapMonth) return Calendar.leapDays(lunarYear)
  return Calendar.monthDays(lunarYear, lunarMonth)
}

export function lunarDayLabel(day1to30) {
  const i = Math.max(1, Math.min(30, day1to30)) - 1
  return LUNAR_DAY_NAMES[i] || `${day1to30}`
}

/** 阳历某月天数 */
export function solarDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate()
}

/** 档案表单：年份范围 index 枚举 */
export function birthYearBounds(kind) {
  if (kind === 'taker') return { minYear: 1920, maxYear: 2010 }
  return { minYear: 1960, maxYear: 2005 }
}

export function numberRangeInclusive(min, max) {
  const out = []
  for (let n = min; n <= max; n++) out.push(n)
  return out
}

export { GAN, ZHI, GAN_IDX }
