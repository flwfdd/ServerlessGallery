/*
 * @Author: flwfdd
 * @Date: 2024-09-01 23:49:10
 * @LastEditTime: 2024-09-11 18:07:21
 * @Description: _(:з」∠)_
 */

// 用户配置
const CONFIG = {
  PORT: 9000, // 端口
  AUTH: {
    JWT_SECRET: 'your-secret-key', // 认证加密密钥
    EXPIRES_IN: '42d', // 登陆过期时间
    USERS: [ // 用户
      { username: 'user', password: 'password' },
    ]
  },
  STORE: {
    TYPE: 'LOCAL', // 存储类型
    LOCAL: {
      PATH: './data/' // 本地存储路径
    },
    COS: {
      SECRET_ID: 'your-secret-id', // 腾讯云COS SecretId
      SECRET_KEY: 'your-secret-key', // 腾讯云COS SecretKey
      BUCKET: 'your-bucket', // 腾讯云COS Bucket
      REGION: 'your-region', // 腾讯云COS Region
      ROOT: '/data/', // 腾讯云COS 根目录
    }
  },
  IMAGE: {
    MAX_SIZE: 10 * 1024 * 1024, // 最大图片大小 10MB
    BASE_URL: 'http://127.0.0.1:9000/data/', // 存储基础路径
    LOW_SUFFIX: '!low', // 低质量图片后缀
    MID_SUFFIX: '!mid', // 中等质量图片后缀
    HIGH_SUFFIX: '!high', // 高质量图片后缀
  }
}

export { CONFIG };
