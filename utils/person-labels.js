const WUXING = {
  water: '水',
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金'
}

const SIXIANG = {
  fire: '火象',
  earth: '土象',
  air: '风象',
  water: '水象'
}

export function labelWuxing(v) {
  return v && WUXING[v] ? WUXING[v] : (v || '—')
}

export function labelSixiang(v) {
  return v && SIXIANG[v] ? SIXIANG[v] : (v || '—')
}

export function labelGender(v) {
  return v === 'female' ? '女' : v === 'male' ? '男' : '—'
}
