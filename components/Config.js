import fs from "node:fs"
import path from "node:path"
import YAML from "yaml"

// 插件根目录
const root = path.join(process.cwd(), "plugins", "alioss-plugin")
export const configPath = path.join(root, "config", "config", "oss.yaml")
export const defaultPath = path.join(root, "config", "default_config", "oss.yaml")

let cache = { mtime: 0, data: null }

// 读取默认值
export function loadDefaults() {
  try {
    return YAML.parse(fs.readFileSync(defaultPath, "utf8")) || {}
  } catch {
    return {}
  }
}

// 生成配置
export function ensureConfig() {
  try {
    if (fs.existsSync(configPath)) return false
    fs.mkdirSync(path.dirname(configPath), { recursive: true })
    fs.copyFileSync(defaultPath, configPath)
    return true
  } catch {
    return false
  }
}

// 规整字段
export function normalize(c) {
  let region = String(c.region || "").trim()
  region = region.replace(/^https?:\/\//, "").replace(/\.aliyuncs\.com.*$/, "").replace(/^oss-/, "")

  let endpoint = String(c.endpoint || "").trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "")
  if (endpoint) {
    const pre = `${c.bucket}.`
    if (endpoint.startsWith(pre)) endpoint = endpoint.slice(pre.length)
    if (!endpoint.includes(".aliyuncs.com")) endpoint = ""
  }

  const dirPrefix = String(c.dirPrefix || "").trim().replace(/^\/+|\/+$/g, "") || "yunzai"
  return { ...c, region, endpoint, dirPrefix }
}

// 热读配置
export function cfg() {
  ensureConfig()
  try {
    const stat = fs.statSync(configPath)
    if (cache.data && stat.mtimeMs === cache.mtime) return cache.data
    const user = YAML.parse(fs.readFileSync(configPath, "utf8")) || {}
    cache = { mtime: stat.mtimeMs, data: normalize({ ...loadDefaults(), ...user }) }
    return cache.data
  } catch {
    return normalize({ ...loadDefaults() })
  }
}

// 是否可用
export function ready(c = cfg()) {
  return !!(c.enabled && c.accessKeyId && c.accessKeySecret && c.bucket && c.region)
}

// 过期毫秒
export function expireMs(c = cfg()) {
  return Math.max(1, Number(c.expireDays) || 3) * 86400000
}
