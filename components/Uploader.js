import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import { cfg, ready, expireMs } from "./Config.js"
import { getClient, objectUrl } from "./OssClient.js"
import { bump } from "./Store.js"

const cache = new Map()
const MAX_CACHE = 500

const MIME = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm"
}

// 取后缀
export function extOf(name = "") {
  const m = String(name).match(/\.([a-z0-9]{2,5})(?:\?|$)/i)
  return m ? m[1].toLowerCase() : ""
}

// 识别类型
export function detectKind(buf, name = "") {
  const ext = extOf(name)
  if (/^(mp4|mov|webm|mkv|avi)$/.test(ext)) return "video"
  if (/^(png|jpe?g|gif|webp|bmp)$/.test(ext)) return "image"
  if (!Buffer.isBuffer(buf) || buf.length < 12) return "image"
  if (buf[0] === 0x89 && buf[1] === 0x50) return "image"
  if (buf[0] === 0xff && buf[1] === 0xd8) return "image"
  if (buf[0] === 0x47 && buf[1] === 0x49) return "image"
  if (buf.toString("ascii", 4, 8) === "ftyp") return "video"
  return "image"
}

// 识别后缀
export function detectExt(buf, name = "") {
  const ext = extOf(name)
  if (MIME[ext]) return ext
  if (!Buffer.isBuffer(buf)) return "png"
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png"
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg"
  if (buf[0] === 0x47 && buf[1] === 0x49) return "gif"
  if (buf.toString("ascii", 8, 12) === "WEBP") return "webp"
  if (buf.toString("ascii", 4, 8) === "ftyp") return "mp4"
  return "png"
}

// 转成缓冲
export function toBuffer(file) {
  try {
    if (Buffer.isBuffer(file)) return file
    if (file && Buffer.isBuffer(file.buffer)) return file.buffer
    if (typeof file !== "string") return null
    if (/^https?:\/\//i.test(file)) return null
    if (file.startsWith("base64://")) return Buffer.from(file.slice(9), "base64")
    if (file.startsWith("data:")) return Buffer.from(file.split(",")[1] || "", "base64")
    if (fs.existsSync(file)) return fs.readFileSync(file)
  } catch {}
  return null
}

// 压缩图片
async function shrink(buf, c) {
  if (c.compress === false) return { buf, ext: "" }
  const limit = Math.max(64, Number(c.compressKB) || 1024) * 1024
  if (buf.length <= limit) return { buf, ext: "" }
  try {
    const sharp = (await import("sharp")).default
    const out = await sharp(buf)
      .resize({ width: Math.max(320, Number(c.compressWidth) || 1280), withoutEnlargement: true })
      .jpeg({ quality: Math.min(95, Math.max(40, Number(c.compressQuality) || 82)) })
      .toBuffer()
    if (out.length < buf.length) return { buf: out, ext: "jpg" }
  } catch {}
  return { buf, ext: "" }
}

// 对象键名
function objectKey(c, kind, hash, ext) {
  const d = new Date()
  const day = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  const prefix = String(c.dirPrefix || "yunzai").replace(/^\/+|\/+$/g, "")
  return `${prefix}/${kind}/${day}/${hash}.${ext}`
}

// 记录缓存
function remember(hash, url) {
  if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value)
  cache.set(hash, url)
}

// 上传缓冲
export async function uploadBuffer(buffer, opts = {}) {
  const c = cfg()
  if (!ready(c)) return null

  const kind = opts.kind || "image"
  let buf = Buffer.from(buffer)
  let ext = detectExt(buf, opts.name || "")

  if (kind === "image") {
    const max = Math.max(1, Number(c.imageMaxMB) || 10) * 1024 * 1024
    if (buf.length > max) return null
    const small = await shrink(buf, c)
    if (small.ext) {
      buf = small.buf
      ext = small.ext
    }
  } else {
    const max = Math.max(1, Number(c.videoMaxMB) || 100) * 1024 * 1024
    if (buf.length > max) return null
  }

  const hash = crypto.createHash("md5").update(buf).digest("hex")
  const hit = cache.get(hash)
  if (hit) return hit

  const key = objectKey(c, kind, hash, ext)
  await getClient(c).put(key, buf, {
    headers: {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=604800",
      "x-oss-object-acl": c.signedUrl ? "private" : "public-read",
      "x-oss-meta-expire": String(Date.now() + expireMs(c)),
      "x-oss-meta-plugin": "alioss-plugin"
    }
  })

  const url = objectUrl(c, key)
  remember(hash, url)
  bump(buf.length)
  return url
}

// 上传文件
export function uploadFile(file, opts = {}) {
  const buf = toBuffer(file)
  if (!buf) return Promise.resolve(null)
  return uploadBuffer(buf, { ...opts, name: opts.name || file })
}
