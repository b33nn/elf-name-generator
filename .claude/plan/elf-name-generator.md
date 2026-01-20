# 精灵名字生成器 - 开发计划

## 项目概述

**需求**：开发一个 Web 应用的精灵名字生成器，支持多种族风格（高等精灵、暗夜精灵、森林精灵等），生成的名字附带精灵语含义解释。

**技术方案**：纯前端 SPA（Vite + React + TypeScript + 本地 JSON 词素库）

**目标**：快速上线 MVP，专注于名字生成质量与用户体验。

---

## 技术架构

### 技术栈

- **构建工具**：Vite
- **框架**：React + TypeScript（严格模式）
- **状态管理**：Zustand（轻量全局状态）
- **样式方案**：CSS Modules + PostCSS + CSS 变量
- **测试**：Vitest + React Testing Library
- **代码质量**：ESLint + Prettier

### 项目结构

```
elf-name-generator/
├── docs/
│   └── ARCHITECTURE_PLAN.md
├── public/
│   └── index.html
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── AppShell.tsx
│   ├── assets/
│   │   ├── fonts/
│   │   └── icons/
│   ├── components/
│   │   ├── buttons/
│   │   ├── cards/
│   │   └── controls/
│   ├── data/
│   │   ├── races/
│   │   │   ├── high-elf.json
│   │   │   ├── night-elf.json
│   │   │   └── forest-elf.json
│   │   └── morphemes/
│   │       ├── common.json
│   │       ├── high-elf.json
│   │       ├── night-elf.json
│   │       └── forest-elf.json
│   ├── engine/
│   │   ├── generator.ts
│   │   ├── meaning.ts
│   │   ├── phonotactics.ts
│   │   ├── rng.ts
│   │   └── selector.ts
│   ├── features/
│   │   ├── generator/
│   │   │   ├── GeneratorPanel.tsx
│   │   │   └── generatorStore.ts
│   │   ├── history/
│   │   │   └── HistoryPanel.tsx
│   │   └── settings/
│   │       └── SettingsPanel.tsx
│   ├── styles/
│   │   ├── globals.css
│   │   └── theme.css
│   ├── types/
│   │   ├── data.ts
│   │   └── engine.ts
│   └── utils/
│       └── strings.ts
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 数据模型设计

### 核心类型定义

```typescript
// 词素（Morpheme）
type Morpheme = {
  id: string;
  text: string;              // 词素文本
  meaning: string;           // 精灵语含义
  position: "prefix" | "stem" | "suffix";
  tags: string[];            // 标签（如 "vowel", "soft", "luminous"）
  weight: number;            // 权重（影响选择概率）
  raceIds: string[];         // 适用种族
  phoneme?: string;          // 音素
  variants?: string[];       // 变体
  gender?: "neutral" | "feminine" | "masculine";
};

// 生成模式
type GenerationPattern = {
  id: string;
  tokens: PatternToken[];    // 如 ["prefix", "stem", "suffix"]
  weight: number;
  gender?: "neutral" | "feminine" | "masculine";
};

// 种族配置
type RaceConfig = {
  id: string;
  displayName: string;
  description: string;
  allowedTags: string[];
  patterns: GenerationPattern[];
  constraints: {
    minLength: number;
    maxLength: number;
    avoidDoubleVowels: boolean;
    bannedClusters: string[];
    substitutions: Array<{ from: string; to: string }>;
  };
  meaningTemplate: {
    order: "prefix-first" | "stem-first" | "custom";
    joiner: string;          // 如 " of ", "，"
  };
};

// 生成结果
type NameResult = {
  name: string;
  meaning: string;
  raceId: string;
  parts: Array<{ morphemeId: string; text: string; meaning: string }>;
  seed?: string;
};
```

### 数据示例

**种族配置（high-elf.json）**：
```json
{
  "id": "high-elf",
  "displayName": "高等精灵",
  "description": "优雅的元音为主，音韵流畅",
  "allowedTags": ["vowel", "soft", "luminous"],
  "patterns": [
    { "id": "p-s", "tokens": ["prefix", "stem"], "weight": 3 },
    { "id": "p-s-sf", "tokens": ["prefix", "stem", "suffix"], "weight": 2 }
  ],
  "constraints": {
    "minLength": 4,
    "maxLength": 10,
    "avoidDoubleVowels": true,
    "bannedClusters": ["kk", "zz"],
    "substitutions": [{ "from": "aa", "to": "a" }]
  },
  "meaningTemplate": { "order": "stem-first", "joiner": " of " }
}
```

---

## 核心模块设计

### 1. 生成引擎（engine/）

**generator.ts**：
- 主生成逻辑
- 输入：种族 ID、选项（种子、性别等）
- 输出：NameResult
- 流程：选择模式 → 选择词素 → 应用音韵规则 → 组装含义

**selector.ts**：
- 加权随机选择
- 标签过滤

**phonotactics.ts**：
- 音韵规则应用
- 替换规则（如 "aa" → "a"）
- 禁止音簇检查

**meaning.ts**：
- 含义拼装
- 根据种族模板组合词素含义

**rng.ts**：
- 可播种的随机数生成器
- 支持确定性生成

### 2. UI 组件（components/ & features/）

**核心组件**：
- `RaceSelector`：种族选择器（卡片式布局）
- `GenerateButton`：生成按钮（主要 CTA）
- `NameCard`：名字展示卡片（名字 + 含义 + 词素拆解）
- `HistoryPanel`：历史记录面板（最近生成的名字）
- `SettingsPanel`：设置面板（种子、性别、长度偏好）

**交互流程**：
1. 用户选择种族
2. （可选）调整设置
3. 点击生成按钮
4. 展示名字卡片
5. 可复制、收藏、查看历史

### 3. 状态管理（generatorStore.ts）

```typescript
type GeneratorState = {
  selectedRaceId: string | null;
  currentResult: NameResult | null;
  history: NameResult[];
  favorites: NameResult[];
  settings: {
    seed?: string;
    gender?: "neutral" | "feminine" | "masculine";
    lengthPreference?: "short" | "medium" | "long";
  };
  actions: {
    selectRace: (raceId: string) => void;
    generate: () => void;
    addToFavorites: (result: NameResult) => void;
    clearHistory: () => void;
  };
};
```

---

## UI/UX 设计

### 视觉风格

**主题**：幻想风格，精灵主题
- **配色**：
  - 主色：深绿/森林绿（#2d5016）
  - 辅色：金色/琥珀色（#d4af37）
  - 背景：深色模式优先（#1a1a1a）
  - 文字：浅色（#e8e8e8）
- **字体**：
  - 标题：衬线字体（优雅感）
  - 正文：无衬线字体（可读性）
  - 名字展示：特殊字体（幻想感）

### 布局设计

**桌面端**：
```
+----------------------------------+
|          Header (Logo)           |
+----------------------------------+
|  [种族选择器]  |   [名字卡片]    |
|                |                  |
|  [设置面板]    |   [历史记录]    |
+----------------------------------+
```

**移动端**：垂直堆叠，种族选择 → 生成按钮 → 名字卡片 → 历史记录

### 交互细节

- **生成动画**：按钮点击后显示加载动画（0.5s）
- **名字展示**：淡入动画 + 轻微缩放
- **复制反馈**：点击复制后显示 Toast 提示
- **历史记录**：滚动列表，最多显示 20 条
- **响应式**：移动端友好，触摸优化

---

## 开发步骤与里程碑

### 阶段 1：项目脚手架（1 天）
- [ ] 初始化 Vite + React + TypeScript 项目
- [ ] 配置 ESLint、Prettier、Vitest
- [ ] 创建项目目录结构
- [ ] 设置 CSS Modules 和主题变量

### 阶段 2：数据模型与样本数据（2 天）
- [ ] 定义 TypeScript 类型（data.ts, engine.ts）
- [ ] 创建 3 个种族配置（高等精灵、暗夜精灵、森林精灵）
- [ ] 创建初始词素库（每个种族 20-30 个词素）
- [ ] 编写词素含义与音韵规则

### 阶段 3：生成引擎 MVP（2 天）
- [ ] 实现 rng.ts（可播种随机数）
- [ ] 实现 selector.ts（加权选择）
- [ ] 实现 generator.ts（核心生成逻辑）
- [ ] 实现 phonotactics.ts（音韵规则）
- [ ] 实现 meaning.ts（含义拼装）
- [ ] 编写单元测试（确保生成稳定性）

### 阶段 4：UI MVP（3 天）
- [ ] 实现 AppShell 和基础布局
- [ ] 实现 RaceSelector 组件
- [ ] 实现 GenerateButton 组件
- [ ] 实现 NameCard 组件
- [ ] 实现 generatorStore（Zustand）
- [ ] 连接 UI 与生成引擎
- [ ] 实现基础样式与主题

### 阶段 5：功能完善（2 天）
- [ ] 实现 HistoryPanel（历史记录）
- [ ] 实现 SettingsPanel（种子、性别、长度）
- [ ] 实现复制功能（Clipboard API）
- [ ] 实现收藏功能（localStorage）
- [ ] 添加生成动画与交互反馈
- [ ] 响应式布局优化

### 阶段 6：内容优化与测试（2 天）
- [ ] 扩充词素库（每个种族 50+ 词素）
- [ ] 优化音韵规则与含义拼装
- [ ] 测试生成质量（重复率、含义通顺性）
- [ ] UI/UX 测试（移动端、桌面端）
- [ ] 性能优化（词素索引、懒加载）

### 阶段 7：部署与文档（1 天）
- [ ] 编写 README.md
- [ ] 部署到 Vercel/Netlify
- [ ] 配置自定义域名（可选）
- [ ] 编写用户指南

---

## 关键考量

### 性能优化
- 词素按标签和种族预索引
- 使用 useMemo 缓存过滤后的词素池
- 历史记录限制在 20 条以内

### 安全性
- 所有数据静态，无用户输入存储
- 避免 dangerouslySetInnerHTML
- 种子输入做基础校验

### 可扩展性
- 词素文件按种族分离，支持懒加载
- 生成引擎与 UI 解耦，便于后续添加后端

### 内容质量
- 建立词素审核清单（音韵、含义、一致性）
- 测试生成结果的重复率（目标 <5%）
- 确保含义拼装语义通顺

### 测试策略
- 单元测试：生成引擎、音韵规则、含义拼装
- 集成测试：完整生成流程
- UI 测试：关键交互流程（选择种族 → 生成 → 复制）

---

## 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 词素库质量不足 | 高 | 建立审核流程，初期人工校验 |
| 生成重复率高 | 中 | 增加词素数量，优化权重分配 |
| 含义拼装不通顺 | 中 | 设计灵活的模板系统，人工调优 |
| 移动端体验差 | 低 | 响应式设计，触摸优化 |
| 性能问题 | 低 | 预索引，懒加载 |

---

## 成功标准

1. **功能完整性**：支持 3 个种族，生成名字 + 含义
2. **生成质量**：重复率 <5%，含义通顺
3. **用户体验**：响应式设计，流畅交互
4. **性能**：生成延迟 <100ms，首屏加载 <2s
5. **代码质量**：TypeScript 严格模式，测试覆盖率 >70%

---

## 后续扩展方向

- 添加更多种族（木精灵、海精灵等）
- 支持姓氏生成
- 导出功能（PNG 图片、JSON）
- 社区分享功能（需后端支持）
- 多语言支持（英文、中文）
