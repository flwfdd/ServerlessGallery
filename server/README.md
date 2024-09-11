<!--
 * @Author: flwfdd
 * @Date: 2024-09-11 16:37:13
 * @LastEditTime: 2024-09-11 18:07:46
 * @Description: _(:з」∠)_
-->

# COS 配置

腾讯云控制台配置：
* 创建 `SecretId` 和 `SecretKey`，需要 `QcloudCOSFullAccess` 权限
* 创建存储桶，记录 `Region` 和 `Bucket`

图片压缩使用数据处理-图片处理功能，参考样式规则如下：
```
styleName: high, styleBody: imageMogr2/format/webp/interlace/1/quality/84/strip
styleName: low, styleBody: imageMogr2/thumbnail/720x720/format/webp/interlace/1/quality/24/strip
styleName: mid, styleBody: imageMogr2/thumbnail/!1080x1080r/format/webp/interlace/1/quality/42/strip
```

将配置填入 `config.ts`，相关配置如下：
* `STORAGE.TYPE` 选择 `COS`
* `STORAGE.COS` 填入`COS`相关配置
* `IMAGE` 填入访问相关配置