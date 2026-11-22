import plugin from "../../../../lib/plugins/plugin.js"
import { cfg, ready, configPath } from "../../components/Config.js"
import { cleanup, stats as ossStats } from "../../components/Cleaner.js"
import { uploadBuffer } from "../../components/Uploader.js"
import { snapshot } from "../../components/Store.js"

const TEST_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

// 时间格式
function time(ts) {
  if (!ts) return "无"
  const d = new Date(ts)
  const p = n => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// 大小格式
function size(bytes) {
  const mb = (Number(bytes) || 0) / 1048576
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(2)} MB`
}

export class ossCommand extends plugin {
  constructor() {
    super({
      name: "阿里OSS指令",
      dsc: "OSS状态/统计/清理/测试",
      event: "message",
      priority: 3000,
      rule: [
        { reg: "^#oss(状态|status)$", fnc: "status", log: false },
        { reg: "^#oss统计$", fnc: "stats", log: false },
        { reg: "^#oss清理$", fnc: "clean", permission: "master" },
        { reg: "^#oss测试$", fnc: "test", permission: "master" }
      ]
    })

    const c = cfg()
    this.task = ready(c) && c.cleanupEnabled !== false
      ? [{ name: "OSS过期清理", cron: c.cleanupCron || "0 0 4 * * ?", fnc: "auto" }]
      : []
  }

  // 查看状态
  async status(e) {
    const c = cfg()
    const s = snapshot()
    const lines = [
      "阿里OSS图床",
      `开关: ${c.enabled ? "开启" : "关闭"}`,
      `配置: ${ready(c) ? "完整" : "不完整"}`,
      `接管: ${(globalThis.Bot?.bot || globalThis.Bot)?.fileToUrl?._alioss ? "已接管" : "未接管"}`,
      `存储桶: ${c.bucket || "未填"} / ${c.region || "未填"}`,
      `目录: ${c.dirPrefix || "yunzai"}`,
      `过期: ${Number(c.expireDays) || 0} 天`,
      `清理: ${c.cleanupEnabled === false ? "关闭" : "开启"}`,
      `上传: ${s.uploads} 次 / ${size(s.bytes)}`,
      `最近上传: ${s.lastTime ? time(s.lastTime) : "无"}`,
      s.lastUrl ? `链接: ${s.lastUrl}` : "链接: 无",
      `已清理: ${s.cleaned} 个`,
      `上次清理: ${time(s.lastCleanup)}`,
      `配置: ${configPath.split(/[\\/]/).slice(-3).join("/")}`
    ]
    await e.reply(lines.join("\n"))
    return true
  }

  // 统计存储
  async stats(e) {
    const res = await ossStats()
    if (!res.ok) return e.reply(`统计失败: ${res.msg}`)
    const c = cfg()
    const days = Number(c.expireDays) || 0
    await e.reply(
      `OSS 存储统计\n` +
      `对象: ${res.count} 个\n` +
      `容量: ${res.mb} MB\n` +
      `超过 ${days} 天: ${res.old} 个`
    )
    return true
  }

  // 手动清理
  async clean(e) {
    const res = await cleanup({ manual: true })
    if (!res.ok) return e.reply(`清理失败: ${res.msg}`)
    await e.reply(`清理完成\n扫描: ${res.scanned} 个\n删除: ${res.deleted} 个\n释放: ${res.mb} MB`)
    return true
  }

  // 测试上传
  async test(e) {
    if (!ready(cfg())) return e.reply("OSS 配置未完成，请先在锅巴中填写")
    const t = Date.now()
    const url = await uploadBuffer(Buffer.from(TEST_PNG, "base64"), { kind: "image" })
    if (!url) return e.reply("上传失败，请查看日志")
    await e.reply(`上传成功 (${Date.now() - t} ms)\n${url}`, false, { at: true })
    return true
  }

  // 定时清理
  async auto() {
    const res = await cleanup()
    if (res.ok) logger.mark(`[alioss] 清理 ${res.deleted} 个 / ${res.mb} MB`)
  }
}
