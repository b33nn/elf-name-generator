# Elf Name Generator

一个基于 AI 的精灵名字生成器，支持生成角色设定和图片。

## 功能特性

- 🎲 **名字生成** - 支持 5 种精灵种族（高等精灵、木精灵、暗夜精灵、血精灵、黑暗精灵）
- 🤖 **AI 角色设定** - 使用 AI 生成角色职业、性格和背景故事
- 🎨 **AI 图片生成** - 生成角色肖像（可选）
- 🔐 **用户认证** - NextAuth 邮箱登录支持
- 📱 **响应式设计** - 适配桌面和移动设备

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **认证**: NextAuth.js
- **数据库**: Prisma + SQLite
- **AI 服务**: Hotaru API (Claude & Gemini)

## 本地开发

1. 克隆仓库
2. 安装依赖：`npm install`
3. 配置环境变量（见下方）
4. 运行开发服务器：`npm run dev`
5. 访问 http://localhost:3000

## 环境变量配置

创建 `.env.local` 文件：

```env
# 文本生成 API（必需）
TEXT_API_KEY=your_api_key_here
TEXT_API_URL=https://api.hotaruapi.top
TEXT_MODEL=claude-sonnet-4-5-20250929

# 图片生成 API（可选）
IMAGE_API_KEY=your_api_key_here
IMAGE_API_URL=https://api.hotaruapi.top
IMAGE_MODEL=gemini-3-pro-image-preview

# NextAuth（可选，用于用户登录）
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# 数据库
DATABASE_URL="file:./dev.db"
```

## 部署到 Vercel

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（同上）
4. 部署

## License

MIT
