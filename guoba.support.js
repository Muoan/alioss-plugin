import { readYamlConfig, writeYamlConfig } from './guoba/utils.js'
import { allSchemas, getAllData, setAllData } from './guoba/loader.js'

export function supportGuoba() {
    return {
        pluginInfo: {
            name: 'alioss-plugin',
            title: '阿里OSS图床',
            author: 'Muoan',
            authorLink: 'https://github.com/Muoan/alioss-plugin',
            isV3: true,
            isV2: false,
            description: '把QQBot渲染图自动传阿里云OSS并发OSS链接丨图片自动过期清理丨省流量省钱',
            showInMenu: 'auto',
            icon: 'mdi:cloud-upload-outline',
            iconColor: '#ff6a00ff'
        },
        configInfo: {
            schemas: allSchemas,
            getConfigData() {
                return getAllData(readYamlConfig)
            },
            setConfigData(configData) {
                return setAllData(configData, writeYamlConfig)
            }
        }
    }
}
