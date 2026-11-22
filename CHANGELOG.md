# 更新日志

## 1.0.0

- 首个版本
- 接管 QQBot `makeMarkdownImage`，渲染图自动传 OSS 并发 OSS 链接
- 接管 `Bot.fileToUrl`，兼容 ICQQ / OneBot 出图
- 同图 MD5 去重，避免重复上传
- 大图自动压缩为 JPEG，降低加载失败率
- 按天分目录 + 定时过期清理，支持手动 `#oss清理`
- 锅巴面板配置支持，支持私有桶签名链接
