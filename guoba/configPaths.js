import path from "path"

// 插件目录
const root = path.resolve("./plugins/alioss-plugin")

// 配置路径
export const configPaths = {
    oss: path.join(root, "config/config/oss.yaml"),
    ossDefault: path.join(root, "config/default_config/oss.yaml")
}
