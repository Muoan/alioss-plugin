import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import chalk from "chalk"
import { ensureConfig } from "./components/Config.js"

// 插件目录
const dir = path.dirname(fileURLToPath(import.meta.url))
const name = path.basename(dir)
const start = Date.now()

let apps = {}
let ok = 0
let bad = 0

try {
  ensureConfig()

  const files = []
  const walk = d => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, entry.name)
      if (entry.isDirectory()) walk(p)
      else if (entry.name.endsWith(".js")) files.push(p)
    }
  }
  walk(path.join(dir, "apps"))

  await Promise.all(files.map(async file => {
    try {
      const mod = await import(pathToFileURL(file).href)
      apps[path.basename(file, ".js")] = mod.default || mod[Object.keys(mod)[0]]
      ok++
    } catch (err) {
      logger.error(`[${name}] 载入 ${path.basename(file)} 失败`, err)
      bad++
    }
  }))
} catch (err) {
  logger.error(`[${name}] 载入插件失败`, err)
}

const cost = Date.now() - start
const line = "-".repeat(30)
const colors = [chalk.cyanBright.bold, chalk.greenBright.bold, chalk.magentaBright.bold, chalk.yellowBright.bold]
const msgs = [`${name} 加载完成`, `成功: ${ok} 个`, bad ? `失败: ${bad}` : `没有失败`, `总耗时: ${cost} ms`]

logger.info(line)
msgs.forEach((msg, i) => logger.info(colors[i % colors.length](msg)))
logger.info(line)

export { apps }
