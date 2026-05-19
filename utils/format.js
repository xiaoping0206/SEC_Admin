const WUXING_LABEL  = { water:'水', wood:'木', fire:'火', earth:'土', metal:'金' }
const SIXIANG_LABEL = { fire:'火象', earth:'土象', air:'风象', water:'水象' }
const GRADE_LABEL   = { S:'S级', A:'A级', B:'B级', C:'C级', D:'D级' }

export function formatWuxing(val)  { return WUXING_LABEL[val]  ?? val }
export function formatSixiang(val) { return SIXIANG_LABEL[val] ?? val }
/** 四象展示（air=风象） */
export const sixiangLabel = (val) => {
  const map = {
    fire: '火象',
    earth: '土象',
    air: '风象',
    water: '水象'
  }
  return map[val] || val
}
export function formatGrade(val)   { return GRADE_LABEL[val]   ?? val }

export function formatDate(timestamp) {
  if (!timestamp) return ''
  const d = new Date(timestamp)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatScore(val) {
  if (val == null) return '—'
  return Math.round(val * 10) / 10 + '分'
}

export function formatGender(val) {
  return val === 'male' ? '男' : '女'
}

export function maskMobile(phone) {
  if (!phone || typeof phone !== 'string') return '—'
  const s = phone.replace(/\s/g, '')
  if (s.length < 7) return s
  if (s.length === 11) return `${s.slice(0, 3)}****${s.slice(-4)}`
  return `${s.slice(0, 3)}****${s.slice(-2)}`
}

/**
 * 兼容：标准对象 / 仅存 timestamp / JSON 字符串 / 可解析文本日期。
 * birthday: {
 *   solar: { year, month, day },
 *   lunar: { year, month, day, isLeap },
 *   type: 'solar' | 'lunar',
 *   timestamp?: number
 * }
 */
export function normalizeBirthday(birthday) {
  if (birthday == null || birthday === '') return null
  if (typeof birthday === 'number' && !Number.isNaN(birthday)) {
    const d = new Date(birthday)
    if (Number.isNaN(d.getTime())) return null
    return {
      solar: {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate()
      },
      type: 'solar',
      timestamp: birthday
    }
  }
  if (typeof birthday === 'string') {
    const t = birthday.trim()
    if (!t) return null
    try {
      const o = JSON.parse(t)
      if (o && typeof o === 'object') return normalizeBirthday(o)
    } catch {
      /* 非 JSON */
    }
    const d = new Date(t)
    if (!Number.isNaN(d.getTime())) {
      const ts = d.getTime()
      return {
        solar: {
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          day: d.getDate()
        },
        type: 'solar',
        timestamp: ts
      }
    }
    return null
  }
  if (typeof birthday !== 'object') return null
  const out = { ...birthday }
  if (
    out.timestamp != null &&
    typeof out.timestamp === 'number' &&
    !Number.isNaN(out.timestamp) &&
    (!out.solar || out.solar.year == null)
  ) {
    const d = new Date(out.timestamp)
    if (!Number.isNaN(d.getTime())) {
      out.solar = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate()
      }
    }
  }
  return out
}

export function formatBirthday(birthday) {
  const b = normalizeBirthday(birthday)
  if (!b) {
    if (typeof birthday === 'string') {
      const t = birthday.trim()
      return t ? t : '—'
    }
    return '—'
  }
  if (b.type === 'lunar' && b.lunar) {
    const { year, month, day } = b.lunar
    if (year == null || month == null || day == null) return '—'
    return `${year}年${month}月${day}日（农历）`
  }
  if (b.solar) {
    const { year, month, day } = b.solar
    if (year == null || month == null || day == null) return '—'
    return `${year}年${month}月${day}日（阳历）`
  }
  return '—'
}
