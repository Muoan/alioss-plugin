# ☁️alioss-plugin 插件说明

****
## 😍插件介绍：
**把 Yunzai 渲染出来的本地图片自动传上阿里云 OSS，再用 OSS 链接发出去。**

****
# 😒安装插件：
<details>
  <summary>展开/收起</summary>

**1.github：**

`git clone --depth=1 https://用户名:令牌@github.com/Muoan/alioss-plugin.git ./plugins/alioss-plugin/`

****

**2.gitcode：**

`git clone --depth=1 https://用户名:令牌@gitcode.com/muoan/alioss-plugin.git ./plugins/alioss-plugin/`

****

**3.gitee：**

`git clone --depth=1 https://用户名:令牌@gitee.com/muoan/alioss-plugin.git ./plugins/alioss-plugin/`

****
# 😁安装依赖：
`pnpm i`

`pnpm install --filter=alioss-plugin`

</details>

****
# 😘功能介绍
<details>
<summary>展开/收起</summary>

| 功能名称 | 功能命令 | 功能讲解 |
| ---- | ---- | ---- |
| OSS状态 | `#oss状态` | 查看开关/接管状态/上传量/上次清理 |
| OSS统计 | `#oss统计` | 统计桶内对象数、容量、过期数量 |
| 手动清理 | `#oss清理` | 立即删除超过保留天数的图片 |
| 上传测试 | `#oss测试` | 传一张测试图，验证配置是否可用 |
| 出图接管 | 自动 | QQBot 渲染图自动上传 OSS 并改用 OSS 链接 |
| 大图压缩 | 自动 | 超过阈值的图压缩成 JPEG，避免平台拒收 |
| 过期清理 | 自动 | 每天定时删除过期对象，可改 Cron |

</details>

****
# 😜工作流程
<details>
<summary>展开/收起</summary>

**1、QQBot 渲染图片**

Yunzai 出图（帮助图、面板图、二维码、markdown 图等）后，QQBot 适配器会调用 `Bot.fileToUrl(file)` 或 `QQBot.makeMarkdownImage` Hook 拿图片地址。

**2、alioss-plugin 接管**

- 挂 `QQBot.makeMarkdownImage` Handler：QQBot 直接拿到本插件返回的 OSS 链接，不再走它自带的素材上传兜底。
- 同时接管 `Bot.fileToUrl`：其它适配器（ICQQ / OneBot 等）出图也会走 OSS。
- 三种形态都兼容：本地路径、`Buffer`、`base64://`。

**3、发送与过期**

同一张图按内容 MD5 去重，同图只传一次；对象按 `目录/类型/日期/MD5.后缀` 存放，方便按天清理。

过期时间默认 3 天，定时任务按天扫一遍桶，把超期对象批量删掉。

</details>

****
# 😁配置说明
<details>
<summary>展开/收起</summary>

配置在 **锅巴面板 → 阿里OSS图床**，或直接改 `plugins/alioss-plugin/config/config/oss.yaml`。

**基础**

| 字段 | 说明 |
| ---- | ---- |
| `enabled` | 总开关。默认 `false`，配置填好后再打开 |
| `bridgeFileToUrl` | 是否接管 `Bot.fileToUrl`，默认开 |
| `dirPrefix` | 对象目录前缀，默认 `yunzai` |

**阿里云凭证**

| 字段 | 说明 |
| ---- | ---- |
| `accessKeyId` / `accessKeySecret` | 建议用只授权该 Bucket 的 RAM 子账号 |
| `bucket` / `region` | 例如 `my-bucket` / `cn-hangzhou` |
| `endpoint` | 可空，默认 `oss-<region>.aliyuncs.com` |
| `cdnDomain` | 可空，填了就用 CDN 域名拼链接，例如 `https://img.xx.com` |
| `signedUrl` / `signTtl` | 私有桶时开启签名，默认 1 小时有效 |

**图片**

| 字段 | 说明 |
| ---- | ---- |
| `imageMaxMB` | 超过这个大小直接跳过上传，走原生逻辑 |
| `compress` | 大图自动压缩开关 |
| `compressKB` / `compressWidth` / `compressQuality` | 压缩阈值、最大宽度、JPEG 质量 |

**视频**

| 字段 | 说明 |
| ---- | ---- |
| `videoEnabled` | 视频是否也走 OSS，默认关 |
| `videoMaxMB` | 视频大小上限 |

**过期清理**

| 字段 | 说明 |
| ---- | ---- |
| `expireDays` | 保留天数，默认 3 天 |
| `cleanupEnabled` | 自动清理开关 |
| `cleanupCron` | 清理时间，默认每天 04:00 |
| `cleanupBatch` | 单批删除数量，默认 1000 |

</details>


****
# 😊省钱建议
<details>
<summary>展开/收起</summary>

**1、过期天数别设太大，聊天图 3 天足够，重要图单独存。**

**2、开 CDN 回源，流量单价更低。**

**3、桶权限用「公共读」，别开公共读写。**

**4、RAM 子账号只给这一个 Bucket 的 `oss:PutObject` / `oss:GetObject` / `oss:ListObjects` / `oss:DeleteObject` 权限。**

**5、也可以配合 OSS 生命周期规则再兜一层，规则和插件清理不冲突。**

</details>

****
# 😂更新：
**对着机器人发 `#重启`，或目录执行 `git pull` 后重启。**

****
# 😜交流：
**QQ群：[872488071](https://qm.qq.com/q/SA5dEJf6MM)**

**云崽论坛：[Yunzai论坛/文档](https://yzai.top)**

# 😊友情链接：
[Miao-Yunzai](https://gitee.com/yoimiya-kokomi/Miao-Yunzai)
[TRSS-Yunzai](https://gitee.com/TimeRainStarSky/Yunzai)
[QQBot-Plugin](https://github.com/ikun25000/QQBot-Plugin)


****
# 😍其他：

**素材来源于网络，仅供交流学习使用，严禁用于商业和非法用途**

**使用本插件产生的 OSS 费用由使用者自行承担**
