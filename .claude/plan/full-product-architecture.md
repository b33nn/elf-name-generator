# Elf Name Generator & OC Creator - 系统架构规划

## 1. 需求分析

### 1.1 核心功能
1. **精灵名字生成**
   - 支持 5 个子种族（High Elf, Wood Elf, Dark Elf, Night Elf, Blood Elf）
   - 支持性别选择（男/女/中性）
   - 单次生成 1/5/10 个名字
   - 每个名字附带含义说明

2. **OC 角色设定生成**
   - 与名字同步生成
   - 包含：种族、职业、性格特征、背景故事
   - 使用固定模板确保质量

3. **角色图片生成**
   - 递进选项（先生成名字和 OC，再选择生成图片）
   - 基于角色信息生成插画
   - 统一幻想插画风格

4. **用户系统**
   - 免费版：20 次角色生成，3 次图片生成/天
   - 付费版：无限角色生成，100 次图片生成/月

5. **角色展示与分享**
   - 角色详情页
   - 支持链接分享
   - 复制文本内容

### 1.2 页面结构（精品工具页面）
**首页（/）**：工具页 + 落地页 + 结果展示页 三合一
- Hero 区域：SEO 内容（标题、描述、关键词）
- 工具区域：名字生成表单（种族、性别、数量选择）
- 结果展示区域：当前生成的角色卡片
- 精选结果区域：展示优秀的生成结果（Gallery）

**角色详情页（/character/[id]）**：
- 角色图片
- 角色名称与基础信息
- 背景故事正文
- 分享按钮

---

## 2. 技术架构

### 2.1 技术栈选择

**前端框架**：Next.js 14 (App Router)
- 理由：支持 SSR/SSG，SEO 友好，API Routes 简化后端

**UI 框架**：Tailwind CSS + shadcn/ui
- 理由：快速开发，响应式设计，组件库丰富

**数据库**：PostgreSQL + Prisma ORM
- 理由：关系型数据库，适合用户、角色、订单等结构化数据

**认证**：NextAuth.js
- 理由：与 Next.js 深度集成，支持多种登录方式

**支付**：Stripe
- 理由：成熟的支付解决方案，支持订阅和一次性付款

**AI 服务**：
- 文本生成：OpenAI GPT-4 或 Claude API
- 图片生成：DALL-E 3 或 Replicate (Stable Diffusion)

**部署**：Vercel
- 理由：Next.js 官方推荐，自动 CI/CD，边缘网络

---

### 2.2 系统架构图

```
┌─────────────────────────────────────────────────────────┐
│                      用户浏览器                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Next.js 应用层                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  首页 (SSR)  │  │ 角色详情页   │  │  用户中心    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   API Routes 层                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 名字生成 API │  │ 图片生成 API │  │  认证 API    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │  OpenAI API  │  │  Stripe API  │
│   数据库     │  │  文本/图片   │  │    支付      │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 3. 数据库设计

### 3.1 数据模型

```prisma
// User 用户表
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  plan          Plan      @default(FREE)
  stripeCustomerId String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  characters    Character[]
  usageRecords  UsageRecord[]
}

enum Plan {
  FREE
  PRO
}

// Character 角色表
model Character {
  id            String    @id @default(cuid())
  name          String
  race          String
  subRace       String
  gender        String
  class         String?
  personality   String[]
  background    String    @db.Text
  imageUrl      String?
  isPublic      Boolean   @default(false)
  isFeatured    Boolean   @default(false)
  createdAt     DateTime  @default(now())

  userId        String?
  user          User?     @relation(fields: [userId], references: [id])
}

// UsageRecord 使用记录表
model UsageRecord {
  id            String    @id @default(cuid())
  userId        String
  type          UsageType
  count         Int       @default(1)
  createdAt     DateTime  @default(now())

  user          User      @relation(fields: [userId], references: [id])
}

enum UsageType {
  CHARACTER_GENERATION
  IMAGE_GENERATION
}
```

---

## 4. API 设计

### 4.1 核心 API 端点

**POST /api/generate/character**
- 功能：生成角色（名字 + OC 设定）
- 请求体：
  ```json
  {
    "race": "high-elf",
    "gender": "female",
    "count": 1
  }
  ```
- 响应：
  ```json
  {
    "characters": [
      {
        "id": "xxx",
        "name": "Aelwen",
        "meaning": "光明之少女",
        "race": "High Elf",
        "gender": "female",
        "class": "Mage",
        "personality": ["Wise", "Calm", "Mysterious"],
        "background": "Born under the silver moon..."
      }
    ]
  }
  ```

**POST /api/generate/image**
- 功能：为角色生成图片
- 请求体：
  ```json
  {
    "characterId": "xxx"
  }
  ```
- 响应：
  ```json
  {
    "imageUrl": "https://..."
  }
  ```

**GET /api/characters/featured**
- 功能：获取精选角色列表
- 响应：角色数组

**GET /api/user/usage**
- 功能：获取用户使用情况
- 响应：
  ```json
  {
    "plan": "FREE",
    "characterGenerations": { "used": 5, "limit": 20 },
    "imageGenerations": { "used": 1, "limit": 3 }
  }
  ```

---

## 5. 前端页面设计

### 5.1 首页布局（精品工具页面）

```
┌─────────────────────────────────────────────────────┐
│                    Header                            │
│  Logo | Elf Name Generator & OC Creator | Login     │
└─────────────────────────────────────────────────────┘
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │           Hero Section (SEO)                 │   │
│  │  H1: Elf Name Generator & OC Creator        │   │
│  │  Description: Generate unique elf names...  │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │         Generator Tool Section               │   │
│  │  [Race Selector] [Gender] [Count]           │   │
│  │  [Generate Button]                           │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │         Result Display Section               │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  │   │
│  │  │Character │  │Character │  │Character │  │   │
│  │  │  Card 1  │  │  Card 2  │  │  Card 3  │  │   │
│  │  └──────────┘  └──────────┘  └──────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │       Featured Characters Gallery            │   │
│  │  (精选角色展示，SEO 内容)                    │   │
│  └─────────────────────────────────────────────┘   │
│                                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │              Footer                          │   │
│  │  About | FAQ | Pricing | Contact            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 5.2 角色卡片组件

```
┌─────────────────────────────┐
│     [Character Image]        │
│                              │
├─────────────────────────────┤
│  Name: Aelwen               │
│  Race: High Elf (Female)    │
│  Class: Mage                │
├─────────────────────────────┤
│  Personality:               │
│  • Wise                     │
│  • Calm                     │
│  • Mysterious               │
├─────────────────────────────┤
│  Background: (truncated)    │
│  Born under the silver...  │
├─────────────────────────────┤
│  [View Details] [Copy Name] │
│  [Generate Image]           │
└─────────────────────────────┘
```

---

## 6. 开发计划

### 6.1 阶段 1：基础架构搭建（2-3 天）
- [ ] 初始化 Next.js 项目
- [ ] 配置 Tailwind CSS + shadcn/ui
- [ ] 设置 PostgreSQL + Prisma
- [ ] 配置 NextAuth.js
- [ ] 创建基础页面结构

### 6.2 阶段 2：名字生成功能（2 天）
- [ ] 实现名字生成引擎（复用之前的逻辑）
- [ ] 创建 API 端点
- [ ] 实现前端表单与结果展示

### 6.3 阶段 3：OC 设定生成（2 天）
- [ ] 设计 OC 生成 Prompt 模板
- [ ] 集成 OpenAI API
- [ ] 实现角色卡片组件

### 6.4 阶段 4：图片生成功能（2 天）
- [ ] 集成 DALL-E 或 Replicate API
- [ ] 实现图片生成流程
- [ ] 优化图片加载与展示

### 6.5 阶段 5：用户系统（3 天）
- [ ] 实现用户注册/登录
- [ ] 实现使用次数限制
- [ ] 创建用户中心页面

### 6.6 阶段 6：支付系统（2 天）
- [ ] 集成 Stripe
- [ ] 实现订阅流程
- [ ] 处理 Webhook

### 6.7 阶段 7：SEO 优化（2 天）
- [ ] 优化首页 SEO 内容
- [ ] 实现精选角色 Gallery
- [ ] 配置 sitemap 和 robots.txt

### 6.8 阶段 8：测试与部署（2 天）
- [ ] 功能测试
- [ ] 性能优化
- [ ] 部署到 Vercel

---

## 7. 关键技术决策

### 7.1 名字生成策略
- 复用之前的词素组合逻辑
- 扩展到 5 个子种族
- 优化音韵规则

### 7.2 OC 生成策略
- 使用固定 Prompt 模板
- 结构化输出（JSON 格式）
- 控制生成长度（200-250 词）

### 7.3 图片生成策略
- 使用 DALL-E 3（质量高但成本高）或 Replicate（成本低但需要调优）
- 统一风格 Prompt："fantasy digital art, elf character portrait, detailed, high quality"
- 缓存生成的图片到 CDN

### 7.4 使用次数限制策略
- 基于 IP + 用户 ID 双重限制
- 免费用户：每日重置
- 付费用户：每月重置

---

## 8. 成本估算

### 8.1 AI API 成本
- **文本生成**（OpenAI GPT-4）：
  - 每次角色生成约 500 tokens
  - 成本：$0.03 / 1K tokens × 0.5 = $0.015 / 次
  - 月成本（假设 10,000 次）：$150

- **图片生成**（DALL-E 3）：
  - 成本：$0.04 / 张（标准质量）
  - 月成本（假设 1,000 张）：$40

### 8.2 基础设施成本
- Vercel Pro：$20 / 月
- PostgreSQL（Supabase）：$25 / 月
- 总计：约 $235 / 月

### 8.3 收入预估
- 付费用户（$19.9 / 月）
- 需要 12 个付费用户即可覆盖成本

---

## 9. 风险与缓解

### 9.1 技术风险
- **AI 输出不稳定**：使用固定模板 + 结构化输出
- **图片生成成本高**：限制免费用户次数，优先推广付费版
- **数据库性能**：使用索引优化查询，考虑缓存

### 9.2 业务风险
- **SEO 竞争激烈**：专注内容质量，持续优化
- **用户留存率低**：提供精选结果 Gallery，增加页面价值
- **滥用免费额度**：IP + 用户 ID 双重限制

---

## 10. 下一步行动

1. 确认技术栈选择
2. 初始化 Next.js 项目
3. 设置开发环境（数据库、API 密钥）
4. 开始阶段 1 开发
