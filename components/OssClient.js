import OSS from "ali-oss"
import { cfg } from "./Config.js"

let client = null
let sign = ""

// 建立客户端
export function getClient(c = cfg()) {
  const host = c.endpoint || `oss-${c.region}.aliyuncs.com`
  const key = [c.accessKeyId, c.accessKeySecret, c.bucket, c.region, host].join("|")
  if (client && sign === key) return client
  const opts = {
    region: c.region,
    accessKeyId: c.accessKeyId,
    accessKeySecret: c.accessKeySecret,
    bucket: c.bucket,
    endpoint: host,
    secure: true,
    timeout: 30000
  }
  client = new OSS(opts)
  sign = key
  return client
}

// 去掉斜杠
const trim = s => String(s || "").replace(/\/+$/, "")

// 拼接地址
export function publicUrl(c, key) {
  if (c.cdnDomain) return `${trim(c.cdnDomain)}/${key}`
  const host = c.endpoint
    ? trim(c.endpoint).replace(/^https?:\/\//, "")
    : `oss-${c.region}.aliyuncs.com`
  return `https://${c.bucket}.${host}/${key}`
}

// 签名地址
export function signUrl(c, key) {
  const ttl = Math.max(60, Number(c.signTtl) || 3600)
  return getClient(c).signatureUrl(key, { expires: ttl })
}

// 对象地址
export function objectUrl(c, key) {
  return c.signedUrl ? signUrl(c, key) : publicUrl(c, key)
}
