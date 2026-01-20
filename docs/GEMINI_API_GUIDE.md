# 接入 Google Gemini API 指南

## 1. 获取 Gemini API Key

### 步骤：

1. 访问 Google AI Studio：https://aistudio.google.com/
2. 点击"Get API Key"
3. 创建新的 API Key
4. 复制 API Key

**免费额度**：
- Gemini 2.0 Flash：每分钟 15 次请求
- 每天 1500 次请求
- 完全免费！

---

## 2. 配置环境变量

创建 `.env.local` 文件：

```bash
AI_PROVIDER=gemini
GEMINI_API_KEY=AIzaSy...your-api-key-here
```

---

## 3. 重启服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

---

## 4. 测试

访问 http://localhost:3001
1. 生成名字
2. 点击"Generate OC"（调用 Gemini API）
3. 点击"Generate Image"（调用 Imagen API）

---

## 5. API 端点

**文本生成（OC）**：
- 模型：`gemini-2.0-flash-exp`
- 端点：`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent`

**图片生成**：
- 模型：`imagen-3.0-generate-001`
- 端点：`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict`

---

## 6. 成本

**完全免费！**
- 无需信用卡
- 每天 1500 次请求
- 适合开发和小规模使用

---

## 7. 限制

- 每分钟 15 次请求
- 每天 1500 次请求
- 如需更高配额，可升级到付费版

---

## 8. 文档

- Gemini API：https://ai.google.dev/docs
- Imagen API：https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview
