import { cfg, ready } from "./Config.js"
import { getClient } from "./OssClient.js"
import { markCleanup, markError } from "./Store.js"

// 对象前缀
function prefixOf(c) {
  return `${String(c.dirPrefix || "yunzai").replace(/^\/+|\/+$/g, "")}/`
}

// 遍历对象
async function forEachObject(c, fn) {
  const client = getClient(c)
  const prefix = prefixOf(c)
  let marker = ""
  for (let page = 0; page < 500; page++) {
    const res = await client.list({ prefix, marker, "max-keys": 1000 })
    const list = res.objects || []
    if (!list.length) return
    await fn(list)
    if (!res.isTruncated) return
    marker = res.nextMarker || list[list.length - 1].name
  }
}

// 清理过期
export async function cleanup({ manual = false } = {}) {
  const c = cfg()
  if (!ready(c)) return { ok: false, msg: "OSS 配置未完成" }
  if (!manual && c.cleanupEnabled === false) return { ok: false, msg: "自动清理未开启" }
  const days = Number(c.expireDays) || 0
  if (days <= 0) return { ok: false, msg: "未设置过期天数" }

  const cutoff = Date.now() - days * 86400000
  const client = getClient(c)
  const prefix = prefixOf(c)
  const batch = Math.min(1000, Math.max(1, Number(c.cleanupBatch) || 1000))
  let deleted = 0
  let scanned = 0
  let bytes = 0

  try {
    let marker = ""
    for (let page = 0; page < 500; page++) {
      const res = await client.list({ prefix, marker, "max-keys": 1000 })
      const list = res.objects || []
      if (!list.length) break
      scanned += list.length
      const dead = list.filter(o => new Date(o.lastModified).getTime() < cutoff)
      for (const o of dead) bytes += Number(o.size) || 0
      for (let i = 0; i < dead.length; i += batch) {
        const part = dead.slice(i, i + batch).map(o => o.name)
        if (!part.length) continue
        await client.deleteMulti(part, { quiet: true })
        deleted += part.length
      }
      if (!res.isTruncated) break
      marker = res.nextMarker || list[list.length - 1].name
    }
  } catch (err) {
    markError(err.message)
    return { ok: false, msg: `清理失败: ${err.message}` }
  }

  if (deleted) markCleanup(deleted)
  return { ok: true, scanned, deleted, mb: (bytes / 1048576).toFixed(2) }
}

// 统计存储
export async function stats() {
  const c = cfg()
  if (!ready(c)) return { ok: false, msg: "OSS 配置未完成" }

  const now = Date.now()
  let count = 0
  let bytes = 0
  let old = 0
  const days = Number(c.expireDays) || 0

  try {
    await forEachObject(c, list => {
      for (const o of list) {
        count++
        bytes += Number(o.size) || 0
        if (days > 0 && now - new Date(o.lastModified).getTime() > days * 86400000) old++
      }
    })
  } catch (err) {
    markError(err.message)
    return { ok: false, msg: `统计失败: ${err.message}` }
  }

  return { ok: true, count, old, mb: (bytes / 1048576).toFixed(2) }
}
