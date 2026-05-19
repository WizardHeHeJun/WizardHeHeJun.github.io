---
name: infographic-template-updater
description: Update template catalogs after adding new infographic templates in my-blog. Keep BUILT_IN_TEMPLATES and the 5 infographic SKILL.md template enumerations in sync. 使用场景：信息图、做张图、画图表、infographic、可视化。仅当用户明确要更新模板枚举时触发；适用前提：cwd 在 d:/bot/my-blog。
---

# Infographic Template Updater (my-blog)

## Overview

当 antv 升级、或 my-blog 新增了自定义 structure / 想暴露更多 antv 内置模板时，把模板名同步到下述两类位置。

**维护范围（仅限）**：

1. `d:/bot/my-blog/src/templates/built-in.ts` 的 `BUILT_IN_TEMPLATES` object
2. 5 个 infographic skill 内的"可用模板"枚举段：
   - `.claude/skills/infographic-creator/SKILL.md`（"可用模板"段）
   - `.claude/skills/infographic-syntax-creator/references/prompt.md`（"my-blog 当前已收录模板"段）
   - 其它三个 skill 不维护模板列表，不需要改

**不维护**：
- 不维护「src/templates/*.ts」全集——my-blog 当前只用 antv 自带模板 + 偶尔的自定义 structure，没有 koharu 那种 50+ 模板分文件
- 不维护 site/AIPlayground/Gallery 相关文件（my-blog 没有这些）

## Workflow

1. 确认新模板来源：
   - antv 升级带的新模板 → 看 `node_modules/@antv/infographic/lib/templates/*.js`
   - my-blog 自定义 structure → 看 `src/designs/structures/*.tsx` 的 `registerStructure(name, ...)` 第一参
2. 按分类（chart/compare/hierarchy/list/relation/sequence/wordcloud 等）加进 `BUILT_IN_TEMPLATES` 对应 array，**不删除、不重命名**已有项
3. 同步加进上面两个 SKILL.md / reference 文件的模板枚举段
4. Sanity check：`Grep "<template-name>"` 跨上述文件确认全部出现

## Notes

- 模板名一律小写连字符
- 新增分类时同时在 `BUILT_IN_TEMPLATES` 加 key + 在 SKILL.md / prompt.md 加段
- 如果 antv 移除了某个模板，**不要从 BUILT_IN_TEMPLATES 删**——加注释标记 deprecated 就行，避免老博文 build 挂

## my-blog 项目特化

- DSL 语法：用 markdown fenced code block，lang = `infographic`，body 是 YAML（不是 koharu 文档里的 indented DSL）
- 玻璃风 theme 自动注入：plugin 在用户没写 `themeConfig` 时自动注入 `palette: [#2337ff, #ff5d8f, #66ccff, #ffd1e4, #b8860b]` + LXGW 字体。**用户写了 themeConfig 则跳过注入**
- 渲染：编译期 `@antv/infographic/ssr.renderToString` 静态化 SVG，零运行时 JS
- 错误降级：YAML 解析错或 antv 报错时输出 `.infographic-error` figure（含原 DSL + 错误信息），build 不挂
- 实现细节见 [plugins/remark-infographic.mjs](../../plugins/remark-infographic.mjs)
