---
name: infographic-syntax-creator
description: Generate AntV Infographic YAML config for my-blog posts. Use when asked to turn user content into the infographic options object (template selection, data structuring, theme). 使用场景：信息图、做张图、画图表、infographic、可视化。仅当用户明确要做信息图时触发；适用前提：cwd 在 d:/bot/my-blog。
---

# Infographic Syntax Creator (my-blog)

## Overview

把用户文字内容转成 my-blog 的 ```infographic 代码块 YAML body（不是 koharu 的 indented DSL）。遵循 `references/prompt.md` 里的规则与模板列表。

## Workflow

1. 读 `references/prompt.md`，确认 YAML 字段、模板列表与输出约束。
2. 拆解用户内容：title / desc / items / hierarchy / metrics；缺失字段合理推断。
3. 选模板（sequence / list / compare / hierarchy / chart / relation / wordcloud）。
4. 按 `references/prompt.md` 的格式写 YAML。
5. 强制约束：
   - 输出唯一一个 ```infographic 代码块，不加额外文字
   - YAML 顶层至少有 `template` 和 `data`
   - `data.items` 是数组，每项至少有 `label`
   - 对比模板（`compare-*`）必须正好两个根节点，对比项作为 children
   - **默认不写 `themeConfig`**——plugin 会自动注入玻璃风。除非用户明确要换主题

## my-blog 项目特化

- DSL 语法：用 markdown fenced code block，lang = `infographic`，body 是 YAML（不是 koharu 文档里的 indented DSL）
- 玻璃风 theme 自动注入：plugin 在用户没写 `themeConfig` 时自动注入 `palette: [#2337ff, #ff5d8f, #66ccff, #ffd1e4, #b8860b]` + LXGW 字体。**用户写了 themeConfig 则跳过注入**
- 渲染：编译期 `@antv/infographic/ssr.renderToString` 静态化 SVG，零运行时 JS
- 错误降级：YAML 解析错或 antv 报错时输出 `.infographic-error` figure（含原 DSL + 错误信息），build 不挂
- 实现细节见 [plugins/remark-infographic.mjs](../../plugins/remark-infographic.mjs)
