---
name: compose-feature
overview: 实现"拼好prompt"功能：允许用户通过拖拽方式组合 predefined prompt 和 custom prompt，在 /compose 路由下创建新的组合 prompt。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Glassmorphism
    - Pink Gradient
    - Card-based
    - Drag-drop
    - Three-column Layout
  fontSystem:
    fontFamily: SF Mono
    heading:
      size: 20px
      weight: 600
    subheading:
      size: 14px
      weight: 500
    body:
      size: 13px
      weight: 400
  colorSystem:
    primary:
      - "#EC4899"
      - "#F472B6"
      - "#DB2777"
    background:
      - "#FDF2F8"
      - "#FCE7F3"
      - "#FFFFFF"
    text:
      - "#831843"
      - "#BE185D"
      - "#9CA3AF"
    functional:
      - "#10B981"
      - "#EF4444"
      - "#3B82F6"
todos:
  - id: install-deps
    content: 安装 @dnd-kit 拖拽库依赖
    status: completed
  - id: extend-types
    content: 扩展 lib/types.ts 添加 ComposeItem 类型定义
    status: completed
    dependencies:
      - install-deps
  - id: create-compose-page
    content: 创建 app/compose/page.tsx 页面路由
    status: completed
    dependencies:
      - extend-types
  - id: create-container
    content: 创建 ComposeContainer.tsx 主容器组件
    status: completed
    dependencies:
      - create-compose-page
  - id: create-source-panel
    content: 创建 PromptSourcePanel.tsx 左侧 predefined 列表
    status: completed
    dependencies:
      - create-container
  - id: create-custom-block
    content: 创建 CustomPromptBlock.tsx 自定义 prompt 组件
    status: completed
    dependencies:
      - create-container
  - id: create-queue
    content: 创建 ComposeQueue.tsx 和 QueueItem.tsx 组装队列
    status: completed
    dependencies:
      - create-container
  - id: create-preview
    content: 创建 ResultPreview.tsx 结果预览组件
    status: completed
    dependencies:
      - create-queue
  - id: integrate-test
    content: 整合所有组件并测试拖拽功能
    status: completed
    dependencies:
      - create-preview
---

