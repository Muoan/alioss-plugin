import { ossSchemas, getOssData, setOssData } from './oss/oss.js'

// 汇总字段
export const allSchemas = [
    ...ossSchemas
]

// 读取全部
export function getAllData(readYamlConfig) {
    return {
        ...getOssData(readYamlConfig)
    }
}

// 写入全部
export function setAllData(configData, writeYamlConfig) {
    return setOssData(configData, writeYamlConfig)
}
