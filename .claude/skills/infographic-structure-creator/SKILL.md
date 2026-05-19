---
name: infographic-structure-creator
description: Generate or update infographic Structure components for my-blog (TypeScript/TSX in src/designs/structures). Use when asked to design, implement, or modify structure layouts (list/compare/sequence/hierarchy/relation/geo/chart), including layout logic, component composition, and registration. 使用场景：信息图、做张图、画图表、infographic、可视化。仅当用户明确要做信息图自定义 structure 时触发；适用前提：cwd 在 d:/bot/my-blog。
---

# Infographic Structure Creator (my-blog)

## Overview

为 my-blog 的 antv infographic 自定义 Structure 组件落点（`src/designs/structures/[Name].tsx`）生成完整 TSX 文件，遵循 `references/structure-prompt.md` 里的 antv 框架规范、布局约束与注册要求。

## Workflow

1. 读 `references/structure-prompt.md`，确认 antv jsx 框架规则、允许的组件清单、输出要求
2. 缺信息就反问：结构分类、布局方向、层级深度、是否需要 add/remove 按钮
3. 选 Item vs Items 数组；用 `getElementBounds` 算布局；装饰元素（连线/箭头）放在 ItemsGroup 之前的独立 Group
4. 输出完整 TS 文件：imports、`[Name]Props extends BaseStructureProps`、组件实现、`registerStructure(...)` 含准确 `composites`
5. 自检：组件清单内、无 SVG cx/cy/r、indexes 全部传递、空状态处理、`tinycolor` 用实例方法

## Notes

- 优先扫 `src/designs/structures/` 找相似 structure 对齐本地风格（**目前目录为空，是骨架**）
- 输出文件命名 `CamelCase.tsx`，注册名小写连字符 + 分类前缀（如 `ListRow.tsx` → `list-row`）
- 写完后请用户在 `src/designs/structures/index.ts`（如有）import 一次以触发注册
- 不用 React 特性（hooks/keys 等）

## my-blog 项目特化

- DSL 语法：用 markdown fenced code block，lang = `infographic`，body 是 YAML（不是 koharu 文档里的 indented DSL）
- 玻璃风 theme 自动注入：plugin 在用户没写 `themeConfig` 时自动注入 `palette: [#2337ff, #ff5d8f, #66ccff, #ffd1e4, #b8860b]` + LXGW 字体。**用户写了 themeConfig 则跳过注入**
- 渲染：编译期 `@antv/infographic/ssr.renderToString` 静态化 SVG，零运行时 JS
- 错误降级：YAML 解析错或 antv 报错时输出 `.infographic-error` figure（含原 DSL + 错误信息），build 不挂
- 实现细节见 [plugins/remark-infographic.mjs](../../plugins/remark-infographic.mjs)
