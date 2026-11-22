import fs from "node:fs"
import path from "node:path"

// 数据目录
const dir = path.join(process.cwd(), "plugins", "alioss-plugin", "data")
const file = path.join(dir, "state.json")

let state = null
let timer = null

// 载入状态
function load() {
  if (state) return state
  try {
    state = JSON.parse(fs.readFileSync(file, "utf8"))
  } catch {
    state = {}
  }
  state.uploads ||= 0
  state.bytes ||= 0
  state.cleaned ||= 0
  state.lastCleanup ||= 0
  state.lastError ||= ""
  state.lastUrl ||= ""
  state.lastTime ||= 0
  return state
}

// 落盘状态
function save() {
  if (timer) return
  timer = setTimeout(() => {
    timer = null
    try {
      fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(file, JSON.stringify(load(), null, 2))
    } catch {}
  }, 2000)
  timer.unref?.()
}

// 记一次上传
export function bump(size, url = "") {
  const s = load()
  s.uploads++
  s.bytes += Number(size) || 0
  if (url) {
    s.lastUrl = url
    s.lastTime = Date.now()
  }
  save()
}

// 记清理结果
export function markCleanup(deleted) {
  const s = load()
  s.cleaned += Number(deleted) || 0
  s.lastCleanup = Date.now()
  save()
}

// 记一次错误
export function markError(msg) {
  const s = load()
  s.lastError = String(msg || "").slice(0, 200)
  save()
}

// 读取状态
export function snapshot() {
  return { ...load() }
}
