# 接入真实 AI API 指南

## 1. 选择 AI 服务提供商

### 推荐方案（性价比）

**文本生成（OC 设定）**：
- 通义千问（阿里云）：¥0.008/1K tokens
- 智谱 GLM：¥0.005/1K tokens
- OpenAI GPT-4：¥0.21/1K tokens

**图片生成**：
- 通义万相（阿里云）：¥0.05/张
- 智谱 CogView：¥0.03/张
- DALL-E 3：¥0.28/张

---

## 2. 获取 API 密钥

### 通义千问（推荐）

1. 访问：https://dashscope.aliyun.com/
2. 注册阿里云账号
3. 开通 DashScope 服务
4. 获取 API Key

### OpenAI

1. 访问：https://platform.openai.com/
2. 注册账号
3. 创建 API Key

---

## 3. 配置环境变量

复制 `.env.example` 到 `.env.local`：

\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local`，填入你的 API Key：

\`\`\`env
AI_PROVIDER=qwen
QWEN_API_KEY=sk-xxxxxxxxxxxxx
\`\`\`

---

## 4. 测试 API

重启开发服务器：

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:3001，测试：
1. 生成名字
2. 点击"Generate OC"（将调用真实 AI API）
3. 点击"Generate Image"（将调用真实 AI API）

---

## 5. 成本估算

**每个完整角色**（名字 + OC + 图片）：
- 使用通义千问：约 ¥0.058（$0.008）
- 使用 OpenAI：约 ¥0.49（$0.07）

**月成本**（假设 1000 个角色）：
- 通义千问：¥58（$8）
- OpenAI：¥490（$70）

---

## 6. 切换 AI 服务商

只需修改 `.env.local` 中的 `AI_PROVIDER`：

\`\`\`env
# 使用通义千问
AI_PROVIDER=qwen
QWEN_API_KEY=sk-xxxxxxxxxxxxx

# 或使用 OpenAI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
\`\`\`

---

## 7. 开发模式

如果没有配置 API Key，系统会自动使用模拟数据，方便开发测试。

---

## 8. 生产部署

部署到 Vercel 时，在环境变量中配置：
- `AI_PROVIDER`
- `QWEN_API_KEY` 或 `OPENAI_API_KEY`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
