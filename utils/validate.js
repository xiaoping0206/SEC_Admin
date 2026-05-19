const WUXING  = ['water', 'wood', 'fire', 'earth', 'metal']
const SIXIANG  = ['fire', 'earth', 'air', 'water']
const MBTI_16  = ['ENFJ','ENFP','ENTJ','ENTP','ESFJ','ESFP','ESTJ','ESTP',
                   'INFJ','INFP','INTJ','INTP','ISFJ','ISFP','ISTJ','ISTP']

export function validateTaker(data) {
  const errors = []
  if (!data.name?.trim())                   errors.push('姓名必填')
  if (data.wuxing  && !WUXING.includes(data.wuxing))   errors.push('五行值无效')
  if (data.sixiang && !SIXIANG.includes(data.sixiang))  errors.push('四象值无效')
  if (data.mbti    && !MBTI_16.includes(data.mbti))     errors.push('MBTI值无效')
  if (data.care_level !== undefined && (data.care_level < 1 || data.care_level > 5))
    errors.push('护理等级须为 1~5')
  return errors
}

export function validateGiver(data) {
  const errors = []
  if (!data.name?.trim())                   errors.push('姓名必填')
  if (data.wuxing  && !WUXING.includes(data.wuxing))   errors.push('五行值无效')
  if (data.sixiang && !SIXIANG.includes(data.sixiang))  errors.push('四象值无效')
  if (data.mbti    && !MBTI_16.includes(data.mbti))     errors.push('MBTI值无效')
  if (data.max_taker_count !== undefined && (data.max_taker_count < 1 || data.max_taker_count > 5))
    errors.push('最大接受人数须为 1~5')
  return errors
}

export function isPhone(val) {
  return /^1[3-9]\d{9}$/.test(val)
}
