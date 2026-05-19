/**
 * 解析 uniCloud.importObject 返回值，取出 Cloud Object method 的业务 data（档案文档）。
 * 兼容：`{ data: doc }` / `{ result: doc }` / `{ result: { code, msg, data } }`。
 */
export function unwrapCloudObjectData(res) {
  if (res == null || typeof res !== 'object') return null

  const unwrapEnvelope = (d) => {
    if (d == null || d === '') return null
    if (typeof d !== 'object') return null
    if (
      Object.prototype.hasOwnProperty.call(d, 'data') &&
      Object.prototype.hasOwnProperty.call(d, 'code') &&
      typeof d.code === 'number' &&
      d.code === 0
    ) {
      return d.data
    }
    return d
  }

  const top = unwrapEnvelope(res.data)
  if (top != null) return top

  if (res.result != null && typeof res.result === 'object') {
    return unwrapEnvelope(res.result) ?? res.result
  }
  return null
}
