# 🪟 ZenGallery

一个极简优雅的文件服务应用，支持文件上传、管理和分享，可用作图床，支持自动压缩和缓存。

基于无服务器架构，使用 Cloudflare 全栈技术构建<del>白嫖免费额度和全球流量</del>，支持一键部署。

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/flwfdd/ZenGallery)

## ✨ ZenGallery 功能亮点

### 🚀 极致性能体验
- **全球边缘节点**：基于 Cloudflare CDN，文件访问速度超快
- **智能图片压缩**：自动生成高/中/低三种质量压缩版本，按需使用
- **极速响应**：Serverless 架构，冷启动时间接近零

### 💡 简单而强大
- **拖拽上传**：支持多文件批量上传
- **智能去重**：MD5 哈希检测，避免重复存储
- **一键分享**：一键生成链接，轻松分享给他人

### 🎯 精心设计的用户体验
- **极简界面**：从手绘图纸中汲取灵感
- **灵动交互**：可爱小动画无处不在
- **深色模式**：支持浅色/深色/跟随系统三种主题
- **国际化**：内置中英双语界面

### 💰 经济实惠的解决方案
- **免费额度充足**：Cloudflare 慷慨的免费额度足够个人使用
- **无服务器成本**：只为实际使用付费，闲置零成本
- **一键部署**：无需复杂配置，3分钟完成部署

## 🎪 功能特性一览

| 功能 | 描述 | 状态 |
|------|------|------|
| 📁 **文件上传** | 拖拽上传，支持多文件，上传进度实时显示 | ✅ |
| 🖼️ **智能压缩** | 自动生成高中低三档压缩版本 | ✅ |
| 🔍 **搜索筛选** | 按文件名、类型、大小等多维度搜索 | ✅ |
| 🔗 **链接分享** | 生成永久访问链接 | ✅ |
| 🌍 **国际化** | 中英双语界面切换 | ✅ |
| 🌙 **主题模式** | 浅色/深色/跟随系统 | ✅ |
| 🔒 **安全保护** | MD5 去重，防止重复恶意上传 | ✅ |

## 🚀 快速开始

### 1. 一键部署（推荐）

点击下方按钮，一键部署到 Cloudflare：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/flwfdd/ZenGallery)

### 2. 手动部署

如果你想自定义配置，可以选择手动部署：

```bash
# 克隆仓库
git clone https://github.com/flwfdd/ZenGallery.git
cd ZenGallery

# 安装依赖
pnpm install

# 配置 Cloudflare
# 编辑 wrangler.jsonc，设置你的域名和资源名称

# 构建
pnpm build

# 部署
pnpm deploy
```

### 3. 本地开发

```bash
# 安装依赖
pnpm install

# 执行数据库迁移
pnpm wrangler d1 migrations apply DB

# 启动开发服务器
pnpm dev
pnpm preview
```

## 🎨 界面预览

![主界面](./docs/images/main-light.jpeg)

## 🛠️ 技术架构

### 前端技术栈

Vue 3 + TypeScript + Tailwind CSS

- **Vue 3 Composition API** - 现代化的响应式框架
- **TypeScript** - 类型安全，开发体验更佳
- **Tailwind CSS 4.0** - 原子化 CSS，界面一致性强

### 后端技术栈

Hono + Cloudflare Workers + R2 + D1

- **Hono** - 轻量级 Web 框架，专为边缘计算优化
- **Cloudflare Workers** - 全球分布式计算平台
- **Cloudflare R2** - 对象存储，兼容 S3 API
- **Cloudflare D1** - 边缘数据库，基于 SQLite

---

如果这个项目对你有帮助，请给我们一个 ⭐️！

<div align="center">
  <sub>Powered by <a href="https://github.com/flwfdd">flwfdd</a> with ❤️</sub>
</div>
