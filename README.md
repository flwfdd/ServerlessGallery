# Serverless Gallery

一个基于 Cloudflare Workers 的无服务器文件画廊应用，支持文件上传、管理和分享。

## 功能特性

- 📁 **文件上传**: 支持多文件上传，单文件最大 50MB
- 🖼️ **图片处理**: 自动生成多种质量的压缩版本
- 🔍 **文件管理**: 搜索、筛选、排序文件
- 📝 **元数据编辑**: 支持文件标题和描述编辑
- 🔗 **分享链接**: 生成文件分享链接
- 🌍 **国际化**: 支持中英双语切换
- 🌙 **主题切换**: 支持浅色/深色/跟随系统主题
- 📱 **响应式设计**: 适配各种设备屏幕

## 技术栈

- **前端**: Vue 3 + TypeScript + Tailwind CSS
- **后端**: Hono + Cloudflare Workers
- **存储**: Cloudflare R2
- **数据库**: Cloudflare D1
- **国际化**: Vue i18n
- **构建工具**: Vite

## 开发

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

## 部署

部署到 Cloudflare Workers：

```bash
pnpm deploy
```
