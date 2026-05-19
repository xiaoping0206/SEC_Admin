import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { maskMobile } from '@/utils/format'

const PROFILE_STORAGE = 'admin_user_profile'

/** 兼容旧缓存的标签 id（避免用纯数字作 :key）：按文案归并到稳定 key */
function normalizeTagsPayload(list) {
  if (!Array.isArray(list)) return []
  return list.map((t, i) => {
    const label = String(t?.label ?? '').trim()
    if (!label) return { id: `tag-empty-${i}`, label: '—' }
    if (/民办|非营利/.test(label)) return { id: 'tag-org', label: /非营利/.test(label) ? label : '非营利性养老机构' }
    if (/普惠/.test(label)) return { id: 'tag-puhui', label }
    return { id: `tag-${i}`, label }
  })
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const token = ref('')
  /** Figma 3588:9352 Ellipse 19 彩色默认头像 */
  const avatar = ref('/static/figma/my/avatar_ellipse19.png')
  const institutionName = ref('机构账号')
  const accountSubtitle = ref('管理员 · SECare Admin')
  const tags = ref([
    { id: 'tag-puhui', label: '普惠' },
    { id: 'tag-org', label: '非营利性养老机构' }
  ])
  const accountTypeDisplay = ref('普惠 / 非营利性养老机构')
  /** 机构侧展示用账号/工号，与 Figma「ID：」行对应 */
  const organizationId = ref('J26040001')
  const mobile = ref('13800138000')
  const wechatNickname = ref('')

  const mobileMasked = computed(() =>
    maskMobile(mobile.value || userInfo.value?.mobile || '')
  )

  function persistProfile() {
    uni.setStorageSync(PROFILE_STORAGE, {
      avatar: avatar.value,
      institutionName: institutionName.value,
      accountSubtitle: accountSubtitle.value,
      tags: tags.value,
      accountTypeDisplay: accountTypeDisplay.value,
      organizationId: organizationId.value,
      mobile: mobile.value,
      wechatNickname: wechatNickname.value
    })
  }

  function loadCachedProfile() {
    const cached = uni.getStorageSync(PROFILE_STORAGE)
    if (!cached || typeof cached !== 'object') return
    if (cached.avatar) {
      const gray =
        cached.avatar === '/static/images/default-avatar.png' ||
        cached.avatar === '/static/images/avatar-mine-placeholder.png' ||
        String(cached.avatar).includes('avatar-mine-placeholder')
      avatar.value = gray ? '/static/figma/my/avatar_ellipse19.png' : cached.avatar
    }
    if (cached.institutionName) institutionName.value = cached.institutionName
    if (cached.accountSubtitle) accountSubtitle.value = cached.accountSubtitle
    if (Array.isArray(cached.tags) && cached.tags.length)
      tags.value = normalizeTagsPayload(cached.tags)
    if (cached.accountTypeDisplay) accountTypeDisplay.value = cached.accountTypeDisplay
    if (cached.organizationId != null && cached.organizationId !== '') organizationId.value = cached.organizationId
    if (cached.mobile != null && cached.mobile !== '') mobile.value = cached.mobile
    if (typeof cached.wechatNickname === 'string') wechatNickname.value = cached.wechatNickname
  }

  function applyRemoteUser(u) {
    if (!u) return
    if (typeof u.nickname === 'string' && u.nickname) institutionName.value = u.nickname
    if (typeof u.avatar === 'string' && u.avatar) avatar.value = u.avatar
    if (typeof u.mobile === 'string' && u.mobile) mobile.value = u.mobile
  }

  async function loginWithWechat(detail) {
    const res = await uniCloud.callFunction({
      name: 'uni-id-co',
      data: { action: 'loginByWeixin', params: { code: detail.code } }
    })
    token.value = res.result.token
    userInfo.value = res.result.userInfo
    uni.setStorageSync('token', token.value)
    applyRemoteUser(userInfo.value)
    persistProfile()
  }

  function logout() {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync('token')
    uni.removeStorageSync(PROFILE_STORAGE)
    uni.reLaunch({ url: '/pages/auth/login' })
  }

  function restoreSession() {
    const saved = uni.getStorageSync('token')
    if (saved) token.value = saved
  }

  /** 主页与资料页载入：会话 + 本地缓存 + uni-id 用户信息 */
  async function init() {
    restoreSession()
    loadCachedProfile()
    applyRemoteUser(userInfo.value)
    persistProfile()
  }

  return {
    userInfo,
    token,
    avatar,
    institutionName,
    accountSubtitle,
    tags,
    accountTypeDisplay,
    organizationId,
    mobile,
    wechatNickname,
    mobileMasked,
    init,
    loginWithWechat,
    logout,
    restoreSession,
    persistProfile
  }
})
