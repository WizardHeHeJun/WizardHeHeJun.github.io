---
name: infographic-item-creator
description: Generate or update infographic Item components for my-blog (TypeScript/TSX in src/designs/items). Use when asked to design, implement, or modify data item visuals, layout logic, or registerItem composites. 使用场景：信息图、做张图、画图表、infographic、可视化。仅当用户明确要做信息图自定义 item 时触发；适用前提：cwd 在 d:/bot/my-blog。
---

# Infographic Item Generator (my-blog)

## Overview

为 my-blog 的 antv infographic 自定义 Item 组件落点（`src/designs/items/[Name].tsx`）生成完整 TSX 文件，遵循 `references/item-prompt.md` 里的 antv 框架规范、布局约束与注册要求。

## Workflow

1. 读 `references/item-prompt.md`，确认 antv jsx 框架规则、允许的组件清单、输出要求
2. 缺信息就反问：想要的视觉、必填字段（icon/label/value/desc/illus）、尺寸、对齐需求
3. 用 `getItemProps` 提取自定义 props；用 `getElementBounds` 计算布局
4. 输出完整 TS 文件：imports、`[Name]Props extends BaseItemProps`、组件实现、`registerItem(...)` 含准确 `composites`
5. 自检：组件清单内、indexes 全部传递、条件渲染逻辑正确、`tinycolor` 用实例方法

## Notes

- 优先扫 `src/designs/items/` 找相似 item 对齐本地风格（**目前目录为空，是骨架**）
- 输出文件命名 `CamelCase.tsx`，注册名小写连字符（如 `DoneList.tsx` → `done-list`）
- 写完后请用户在 `src/designs/items/index.ts`（如有）import 一次以触发注册
- 不用 React 特性（hooks/keys 等）

## my-blog 项目特化

- DSL 语法：用 markdown fenced code block，lang = `infographic`，body 是 YAML（不是 koharu 文档里的 indented DSL）
- 玻璃风 theme 自动注入：plugin 在用户没写 `themeConfig` 时自动注入 `palette: [#2337ff, #ff5d8f, #66ccff, #ffd1e4, #b8860b]` + LXGW 字体。**用户写了 themeConfig 则跳过注入**
- 渲染：编译期 `@antv/infographic/ssr.renderToString` 静态化 SVG，零运行时 JS
- 错误降级：YAML 解析错或 antv 报错时输出 `.infographic-error` figure（含原 DSL + 错误信息），build 不挂
- 实现细节见 [plugins/remark-infographic.mjs](../../plugins/remark-infographic.mjs)
