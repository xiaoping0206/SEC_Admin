/** Parse uniCloud.throw Error(JSON.stringify({ code, msg })) */
export function parseCloudError(e) {
  const raw = e?.message ?? e?.errMsg ?? String(e ?? '')
  try {
    const o = JSON.parse(raw)
    if (o && typeof o.msg === 'string') return o.msg
  } catch {
    /* plain string */
  }
  return raw || '操作失败'
}

export function toastCloudError(e) {
  uni.showToast({ title: parseCloudError(e), icon: 'none' })
}
