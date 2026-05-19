/**
 * Figma「我的」页字体：微信小程序中仅写 CSS @font-face 常无效，须在 App.vue onLaunch 调用
 * uni.loadFontFace({ global: true })。与 styles/figma-my-fonts.scss 中的 font-family 一致。
 */

function escapedFontUrl(staticPathFromRoot) {
  const trimmed = staticPathFromRoot.replace(/^\/+/, '')
  const segs = trimmed.split('/')
  const name = segs.pop()
  return '/' + [...segs, encodeURIComponent(name)].join('/')
}

const FIGMA_FACE_LIST = [
  {
    family: 'Kingnammm Maiyuan 2',
    path: '/static/fonts/Kingnammm-Maiyuan-II-Regular-2.ttf'
  },
  {
    family: 'Alimama FangYuanTi VF',
    path: '/static/fonts/AlimamaFangYuanTi-VF.ttf'
  },
  {
    family: 'Alibaba PuHuiTi 2',
    path: '/static/fonts/AlibabaPuHuiTi-2-55-Regular.ttf'
  },
  {
    family: 'id POP FTMARU',
    path: '/static/fonts/id-ftmaru400b-2.otf'
  }
]

export function loadFigmaFontsFace() {
  if (typeof uni === 'undefined' || typeof uni.loadFontFace !== 'function') {
    return
  }
  FIGMA_FACE_LIST.forEach(({ family, path }) => {
    const src = escapedFontUrl(path)
    uni.loadFontFace({
      global: true,
      family,
      source: `url("${src}")`,
      success() {},
      fail() {}
    })
  })
}
