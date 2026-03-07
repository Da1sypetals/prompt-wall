---
name: prompt-wall-nextjs
overview: 创建基于 Next.js + Upstash Redis 的 Prompt Wall 应用，支持密码认证、Prompt CRUD、搜索功能，使用粉紫色调 UI。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Pink Theme
    - Gradient Cards
    - Glassmorphism
    - Minimalist
    - Modern UI
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 18px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#EC4899"
      - "#D946EF"
      - "#F472B6"
      - "#F9A8D4"
    background:
      - "#FFF0F5"
      - "#FCE7F3"
      - "#FFFFFF"
    text:
      - "#831843"
      - "#BE185D"
      - "#FFFFFF"
    functional:
      - "#10B981"
      - "#EF4444"
      - "#F59E0B"
todos:
  - id: init-project
    content: 初始化 Next.js 项目并安装依赖（shadcn/ui、@upstash/redis）
    status: completed
  - id: setup-config
    content: 配置 Tailwind、TypeScript 和环境变量
    status: completed
    dependencies:
      - init-project
  - id: create-types
    content: 创建类型定义和 Redis 客户端
    status: completed
    dependencies:
      - setup-config
  - id: implement-auth
    content: 实现认证 API 和登录状态管理
    status: completed
    dependencies:
      - create-types
  - id: implement-prompt-api
    content: 实现 Prompt CRUD API 端点
    status: completed
    dependencies:
      - create-types
  - id: create-components
    content: 创建 PromptCard、PromptForm、SearchBar、LoginDialog 组件
    status: completed
    dependencies:
      - implement-auth
      - implement-prompt-api
  - id: implement-page
    content: 实现主页面和布局
    status: completed
    dependencies:
      - create-components
  - id: test-iterate
    content: 测试所有功能并修复问题直到正常运行
    status: completed
    dependencies:
      - implement-page
---

## 产品概述

创建一个 Prompt Wall Web 应用，用于管理和展示 Prompt 集合。

## 核心功能

### 1. Prompt 管理

- 每个 Prompt 包含 `title` 和 `content` 两个字段
- 支持创建、编辑、删除 Prompt
- 所有 Prompts 以 JSON 数组形式存储在 Redis 的 `prompt-wall` key 中

### 2. 认证机制

- 使用 `PROMPT_WALL_PASSWORD` 环境变量作为密码
- 明文比较，无需哈希
- Login/Logout 功能

### 3. 搜索与筛选

- 按标题子串搜索
- 按内容子串搜索
- Clear 按钮清空搜索条件

### 4. 复制功能

- 每个卡片有 Copy 按钮
- 复制格式（不含 code block）：

```
# <title>

<content>
```

### 5. UI 设计

- 粉色为主色调
- 卡片颜色在粉紫到玫红之间的光谱渐变
- 响应式布局

### 6. 数据存储约束

- 使用 Redis 存储
- 只能操作 `prompt-wall` 这一个 key
- Redis 中还有其他 app 数据，不得影响

## 技术栈选择

| 技术 | 选择 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 14+ (App Router) | React 全栈框架，支持 API Routes |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS，支持自定义主题 |
| 组件库 | shadcn/ui | 基于 Radix UI 的无样式组件 |
| Redis 客户端 | @upstash/redis | 无服务器 Redis，与 Vercel 集成友好 |


## 实现方案

### 架构设计

采用 Next.js App Router 架构：

- **服务端组件**：页面渲染、数据获取
- **API Routes**：后端 CRUD 操作、认证
- **客户端组件**：交互功能（搜索、表单、状态管理）

### 数据存储策略

- Redis key: `prompt-wall`
- 值格式: `Prompt[]` 的 JSON 字符串
- 每次操作读取整个列表，修改后写回
- 适用场景：Prompt 数量较少（<1000），操作简单

### 认证流程

1. 登录时客户端发送密码到 `/api/auth`
2. 服务端比对 `PROMPT_WALL_PASSWORD`
3. 成功则设置 httpOnly cookie 标记登录状态
4. 后续编辑/删除操作校验 cookie

### API 设计

| 端点 | 方法 | 功能 |
| --- | --- | --- |
| `/api/prompts` | GET | 获取所有 Prompts |
| `/api/prompts` | POST | 创建 Prompt（需认证） |
| `/api/prompts/[id]` | PUT | 更新 Prompt（需认证） |
| `/api/prompts/[id]` | DELETE | 删除 Prompt（需认证） |
| `/api/auth` | POST | 登录验证 |
| `/api/auth/logout` | POST | 退出登录 |


### 目录结构

```
/Users/daisy/develop/prompt-wall/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts          # [NEW] 登录/登出 API
│   │   └── prompts/
│   │       ├── route.ts          # [NEW] 获取/创建 Prompts
│   │       └── [id]/
│   │           └── route.ts      # [NEW] 更新/删除单个 Prompt
│   ├── page.tsx                  # [NEW] 主页面
│   ├── layout.tsx                # [NEW] 根布局
│   └── globals.css               # [NEW] 全局样式
├── components/                   # React 组件
│   ├── ui/                       # shadcn/ui 组件
│   ├── PromptCard.tsx            # [NEW] Prompt 卡片组件
│   ├── PromptForm.tsx            # [NEW] 创建/编辑表单
│   ├── SearchBar.tsx             # [NEW] 搜索栏
│   └── LoginDialog.tsx           # [NEW] 登录弹窗
├── lib/
│   ├── redis.ts                  # [NEW] Redis 客户端
│   ├── auth.ts                   # [NEW] 认证工具
│   └── utils.ts                  # [NEW] 工具函数
├── types/
│   └── index.ts                  # [NEW] TypeScript 类型定义
├── public/                       # 静态资源
├── .env.local                    # [NEW] 本地环境变量
├── next.config.js                # [NEW] Next.js 配置
├── tailwind.config.ts            # [NEW] Tailwind 配置
├── tsconfig.json                 # [NEW] TypeScript 配置
└── package.json                  # [NEW] 项目依赖
```

## 实现注意事项

### Redis 安全操作

- 严格只读写 `prompt-wall` key
- 使用 JSON 序列化/反序列化
- 添加错误处理和重试机制

### 性能优化

- Prompt 列表在服务端获取，页面 SSG/SSR
- 搜索在客户端进行，避免频繁 API 调用
- 卡片颜色使用 CSS 渐变，无需动态计算

### 安全性

- 环境变量不暴露到客户端
- API 操作校验认证状态
- cookie 设置 httpOnly 和 secure

### 错误处理

- Redis 连接失败时显示友好错误
- API 错误统一返回 JSON 格式
- 客户端错误边界处理

## 设计风格

采用现代简约的粉色系设计，结合玻璃拟态效果，打造温馨而专业的 Prompt 管理界面。

### 整体布局

- 顶部导航栏：Logo + Login/Logout 按钮
- 搜索区域：双搜索框 + Clear 按钮 + New Prompt 按钮
- 卡片网格：响应式布局，2-4 列自适应

### 卡片设计

- 圆角卡片（rounded-2xl）
- 粉紫到玫红的光谱渐变背景
- 毛玻璃效果（backdrop-blur）
- 顶部：标题 + 编辑/删除/复制按钮
- 中部：内容预览（最多 N 字符）
- 悬停效果：轻微上浮 + 阴影增强

### 交互设计

- 按钮悬停：缩放 + 颜色加深
- 卡片悬停：上浮动画
- 复制成功：Toast 提示
- 登录弹窗：居中模态框

### 响应式

- 桌面：4 列网格
- 平板：2 列网格
- 手机：1 列网格