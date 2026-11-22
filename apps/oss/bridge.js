import plugin from "../../../../lib/plugins/plugin.js"
import { cfg, ready } from "../../components/Config.js"
import { toBuffer, detectKind, uploadBuffer } from "../../components/Uploader.js"

// 接管出图
const target = globalThis.Bot?.bot || globalThis.Bot
if (target && typeof target.fileToUrl === "function" && !target.fileToUrl._alioss) {
  const origin = target.fileToUrl.bind(target)
  target.fileToUrl = async function (file, opts = {}) {
    const c = cfg()
    if (!ready(c) || c.bridgeFileToUrl === false) return origin(file, opts)
    try {
      const buf = toBuffer(file)
      if (!buf) return origin(file, opts)
      const kind = detectKind(buf, typeof file === "string" ? file : "")
      if (kind === "video" && c.videoEnabled !== true) return origin(file, opts)
      const url = await uploadBuffer(buf, { kind, name: typeof file === "string" ? file : "" })
      if (url) return url
    } catch (err) {
      logger.warn(`[alioss] 上传失败 ${err.message}`)
    }
    return origin(file, opts)
  }
  target.fileToUrl._alioss = true
  logger.info("[alioss] 已接管 Bot.fileToUrl")
}

export class ossBridge extends plugin {
  constructor() {
    const c = cfg()
    const open = ready(c)
    super({
      name: "阿里OSS图床",
      dsc: "QQBot出图自动转OSS链接",
      event: "message",
      priority: 100,
      handler: open ? [{ key: "QQBot.makeMarkdownImage", fn: "onImage" }] : [],
      rule: []
    })
    this.task = []
  }

  // 处理QQBot图片
  async onImage(e, args) {
    const c = cfg()
    if (!ready(c)) return

    const buf = args?.buffer || toBuffer(args?.file)
    if (!buf) return

    try {
      const url = await uploadBuffer(buf, { kind: "image", name: args?.file?.name || "" })
      if (!url) return
      return { url }
    } catch (err) {
      logger.warn(`[alioss] 图片上传失败 ${err.message}`)
      return
    }
  }
}
