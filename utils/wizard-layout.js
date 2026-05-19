/**
 * Figma 3894 向导页底栏度量（375 设计稿 px → 同值 rpx）
 * Step1 滚动区下沿距屏底 116；Rectangle 22 渐变叠在滚动区与按钮之间
 */

export const WIZ_BTN_H_RPX = 92
export const WIZ_GAP_SCROLL_END_RPX = 22
export const WIZ_RECT22_H_RPX = 232
export const WIZ_BTN_SIDE_RPX = 30

/** 主内容滚动区下沿距屏底（Step1 填写资料 / Step2 标签选择，Figma 116） */
export const WIZ_SCROLL_END_RPX = 116
/** @deprecated 使用 WIZ_SCROLL_END_RPX */
export const WIZ_S1_SCROLL_END_RPX = WIZ_SCROLL_END_RPX
/** Step1：主按钮距屏底 48 */
export const WIZ_S1_BTN_BOTTOM_RPX = 48
/** Step2/3：主按钮 bottom 76（下方有「暂不设置」） */
export const WIZ_S2_BTN_BOTTOM_RPX = 76

/** 滚动区下沿距屏幕底（rpx） */
export function getScrollEndFromBottomRpx(step) {
  if (step === 1 || step === 2) return WIZ_SCROLL_END_RPX
  return WIZ_S2_BTN_BOTTOM_RPX + WIZ_BTN_H_RPX + WIZ_GAP_SCROLL_END_RPX
}

/** 底栏总高（含 Rectangle 22 渐变，在滚动区下方） */
export function getFootTotalFromBottomRpx(step) {
  return getScrollEndFromBottomRpx(step) + WIZ_RECT22_H_RPX
}

/** Step2 已选标签白卡 Rectangle 3274（Figma 固定高 400） */
export const S2_PICKED_H_RPX = 400

/** Step2 标签页：头图 + 已选白卡 + Tab（不含下方标签滚动区） */
export const S2_FIXED_TOP_RPX =
  28 + 164 + 8 + 44 + 8 + 20 + 24 + S2_PICKED_H_RPX + 32 + 60 + 17

/** Step3 MBTI：底行文字（内向/直觉/情感/感知）底边距屏底 */
export const S3_MBTI_GRID_BOTTOM_RPX = 600
