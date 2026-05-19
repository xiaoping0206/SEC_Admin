// Thin wrapper for uniCloud Cloud Object calls with unified error handling

export function callObj(objectName, method, params = {}) {
  return uniCloud.importObject(objectName)[method](params).catch(err => {
    let parsed = {}
    try { parsed = JSON.parse(err.message) } catch (_) { parsed.msg = err.message }
    uni.showToast({ title: parsed.msg || '请求失败', icon: 'none' })
    throw err
  })
}

export function callFn(name, data = {}) {
  return uniCloud.callFunction({ name, data }).then(res => {
    if (res.result.code !== 0) {
      uni.showToast({ title: res.result.msg || '操作失败', icon: 'none' })
      throw new Error(res.result.msg)
    }
    return res.result
  })
}
