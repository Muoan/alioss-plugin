import { configPaths } from '../configPaths.js'

export const ossSchemas = [
    {
        label: '基础设置',
        component: 'SOFT_GROUP_BEGIN'
    },
    {
        field: 'enabled',
        label: '启用OSS图床',
        component: 'Switch',
        required: false
    },
    {
        field: 'bridgeFileToUrl',
        label: '接管fileToUrl',
        component: 'Switch',
        required: false
    },
    {
        field: 'dirPrefix',
        label: '对象目录前缀',
        component: 'Input',
        required: false,
        componentProps: { placeholder: '默认 yunzai' }
    },
    {
        field: 'SOFT_SEPARATOR_OSS',
        label: '阿里云凭证',
        component: 'SOFT_GROUP_BEGIN'
    },
    {
        field: 'accessKeyId',
        label: 'AccessKeyId',
        component: 'Input',
        required: false,
        componentProps: { placeholder: 'LTAI...' }
    },
    {
        field: 'accessKeySecret',
        label: 'AccessKeySecret',
        component: 'InputPassword',
        required: false,
        componentProps: { placeholder: '输入密钥', showPassword: true }
    },
    {
        field: 'bucket',
        label: 'Bucket名称',
        component: 'Input',
        required: false,
        componentProps: { placeholder: 'my-bucket' }
    },
    {
        field: 'region',
        label: '地域Region',
        component: 'Input',
        required: false,
        componentProps: { placeholder: 'cn-hangzhou' }
    },
    {
        field: 'endpoint',
        label: 'Endpoint',
        component: 'Input',
        required: false,
        componentProps: { placeholder: '可空,默认 oss-Region.aliyuncs.com' }
    },
    {
        field: 'cdnDomain',
        label: 'CDN域名',
        component: 'Input',
        required: false,
        componentProps: { placeholder: '可空,如 https://img.xx.com' }
    },
    {
        field: 'signedUrl',
        label: '私有桶签名',
        component: 'Switch',
        required: false
    },
    {
        field: 'signTtl',
        label: '签名有效期(秒)',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 60, max: 604800 }
    },
    {
        field: 'SOFT_SEPARATOR_IMAGE',
        label: '图片设置',
        component: 'SOFT_GROUP_BEGIN'
    },
    {
        field: 'imageMaxMB',
        label: '图片大小上限(MB)',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 1, max: 50 }
    },
    {
        field: 'compress',
        label: '大图自动压缩',
        component: 'Switch',
        required: false
    },
    {
        field: 'compressKB',
        label: '压缩阈值(KB)',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 64, max: 10240 }
    },
    {
        field: 'compressWidth',
        label: '压缩最大宽度',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 320, max: 4096 }
    },
    {
        field: 'compressQuality',
        label: '压缩质量',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 40, max: 95 }
    },
    {
        field: 'SOFT_SEPARATOR_VIDEO',
        label: '视频设置',
        component: 'SOFT_GROUP_BEGIN'
    },
    {
        field: 'videoEnabled',
        label: '视频走OSS',
        component: 'Switch',
        required: false
    },
    {
        field: 'videoMaxMB',
        label: '视频大小上限(MB)',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 1, max: 500 }
    },
    {
        field: 'SOFT_SEPARATOR_EXPIRE',
        label: '过期清理',
        component: 'SOFT_GROUP_BEGIN'
    },
    {
        field: 'expireDays',
        label: '保留天数',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 1, max: 365 }
    },
    {
        field: 'cleanupEnabled',
        label: '自动清理',
        component: 'Switch',
        required: false
    },
    {
        field: 'cleanupCron',
        label: '清理Cron',
        component: 'Input',
        required: false,
        componentProps: { placeholder: '0 0 4 * * ?' }
    },
    {
        field: 'cleanupBatch',
        label: '单批删除数',
        component: 'InputNumber',
        required: false,
        componentProps: { min: 1, max: 1000 }
    }
]

export function getOssData(readYamlConfig) {
    const read = (key, def) => readYamlConfig(configPaths.oss, key, def)
    return {
        enabled: read('enabled', false),
        bridgeFileToUrl: read('bridgeFileToUrl', true),
        dirPrefix: read('dirPrefix', 'yunzai'),
        accessKeyId: read('accessKeyId', ''),
        accessKeySecret: read('accessKeySecret', ''),
        bucket: read('bucket', ''),
        region: read('region', 'cn-hangzhou'),
        endpoint: read('endpoint', ''),
        cdnDomain: read('cdnDomain', ''),
        signedUrl: read('signedUrl', false),
        signTtl: read('signTtl', 3600),
        imageMaxMB: read('imageMaxMB', 10),
        compress: read('compress', true),
        compressKB: read('compressKB', 1024),
        compressWidth: read('compressWidth', 1280),
        compressQuality: read('compressQuality', 82),
        videoEnabled: read('videoEnabled', false),
        videoMaxMB: read('videoMaxMB', 100),
        expireDays: read('expireDays', 3),
        cleanupEnabled: read('cleanupEnabled', true),
        cleanupCron: read('cleanupCron', '0 0 4 * * ?'),
        cleanupBatch: read('cleanupBatch', 1000)
    }
}

export function setOssData(configData, writeYamlConfig) {
    const put = (key, def) => writeYamlConfig(configPaths.oss, key, configData[key] ?? def)
    return [
        put('enabled', false),
        put('bridgeFileToUrl', true),
        put('dirPrefix', 'yunzai'),
        put('accessKeyId', ''),
        put('accessKeySecret', ''),
        put('bucket', ''),
        put('region', 'cn-hangzhou'),
        put('endpoint', ''),
        put('cdnDomain', ''),
        put('signedUrl', false),
        put('signTtl', 3600),
        put('imageMaxMB', 10),
        put('compress', true),
        put('compressKB', 1024),
        put('compressWidth', 1280),
        put('compressQuality', 82),
        put('videoEnabled', false),
        put('videoMaxMB', 100),
        put('expireDays', 3),
        put('cleanupEnabled', true),
        put('cleanupCron', '0 0 4 * * ?'),
        put('cleanupBatch', 1000)
    ].every(Boolean)
}
