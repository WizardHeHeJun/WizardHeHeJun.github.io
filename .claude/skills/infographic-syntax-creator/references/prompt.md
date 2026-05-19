# 信息图 YAML 生成规范（my-blog 版）

> **my-blog 项目说明**：本 reference 来自 cosZone/astro-koharu 项目移植。在 my-blog 中：
> - 输出 YAML body（不是独立 HTML 文件，也不是 koharu 的 indented `infographic <tpl>` DSL）
> - 玻璃 theme 自动注入（无需手写 themeConfig）
> - 实际 plugin 实现见 [plugins/remark-infographic.mjs](../../../../plugins/remark-infographic.mjs)

本文件指导生成符合 my-blog `remark-infographic` 解析约定的 markdown 代码块。

## 目录
- 目标与输入输出
- 代码块语法
- YAML 字段规范
- 模板选择
- 生成流程
- 输出格式
- 常见问题与最佳实践

## 目标与输入输出

- **输入**：用户的文字内容或需求描述
- **输出**：唯一一个 ```infographic 代码块，body 是 YAML

## 代码块语法

外层 fence 用 markdown 标准三反引号，lang 字段是 `infographic`，可选第二个 token 作为 template override：

````markdown
```infographic
<YAML body>
```
````

或：

````markdown
```infographic list-zigzag
<YAML body, 不含 template 字段>
```
````

YAML 内 `template` 字段优先于 lang 第二个 token。

## YAML 字段规范

顶层字段：

- `template` (string, 必需): 模板名，从下方"可用模板"列表选
- `data` (object, 必需):
  - `title` (string, 可选): 信息图标题
  - `desc` (string, 可选): 副标题/描述
  - `items` (array, 必需): 数据项数组
- `themeConfig` (object, 可选): **默认不写**。plugin 自动注入玻璃风主题
- `width` / `height` (number, 可选): 默认 800 × 480

`data.items[i]` 字段：

- `label` (string): 项标题
- `value` (number, 可选): 数值
- `desc` (string, 可选): 项描述
- `icon` (string, 可选): Iconify 名，如 `mdi/chart-line`
- `children` (array, 可选): 层级子项，递归同结构

约束：
- 对比类模板（`compare-*`）必须构建恰好 **两个根节点**，所有对比项作为这两个根节点的 children
- `hierarchy-structure` 最多支持 3 层（根 → 分组 → 子项），`items` 顺序即从上到下
- 禁止输出 JSON 字面量或 markdown 内嵌（YAML 本身是 plain text）

## 模板选择

**选择原则**：
- 列表/要点 → `list-*`
- 顺序/流程/阶段 → `sequence-*`
- 二元或多元对比 → `compare-*`
- 层级关系 → `hierarchy-*`
- 数据统计 → `chart-*`
- 关系/流图 → `relation-*`
- 词云 → `word-cloud`

### my-blog 当前已收录模板

源自 `src/templates/built-in.ts`：

- chart: `chart-pie-plain-text`, `chart-pie-compact-card`
- compare: `compare-quadrant`, `compare-hierarchy-left-right-circle-node-pill-badge`
- hierarchy: `hierarchy-mindmap`, `hierarchy-structure`, `hierarchy-tree`
- list: `list-zigzag`
- relation: `relation-dagre-flow`
- sequence: `sequence-interaction`, `sequence-stairs`
- wordcloud: `word-cloud`

### antv 包内其它常见模板（按 koharu 经验，不一定全部在 antv 当前版本可用）

> 这一段保留 koharu 原文的模板枚举，作为"可以尝试"的候选。**实际可用以 antv 包 ssr 渲染成功为准**——如果某个模板渲染失败，换 my-blog 已收录的同类模板。

- sequence-zigzag-steps-underline-text
- sequence-horizontal-zigzag-underline-text
- sequence-horizontal-zigzag-simple-illus
- sequence-circular-simple
- sequence-filter-mesh-simple
- sequence-mountain-underline-text
- sequence-cylinders-3d-simple
- sequence-color-snake-steps-horizontal-icon-line
- sequence-pyramid-simple
- sequence-funnel-simple
- sequence-roadmap-vertical-simple
- sequence-roadmap-vertical-plain-text
- sequence-zigzag-pucks-3d-simple
- sequence-ascending-steps
- sequence-ascending-stairs-3d-underline-text
- sequence-snake-steps-compact-card
- sequence-snake-steps-underline-text
- sequence-snake-steps-simple
- sequence-stairs-front-compact-card
- sequence-stairs-front-pill-badge
- sequence-timeline-simple
- sequence-timeline-rounded-rect-node
- sequence-timeline-simple-illus
- compare-binary-horizontal-simple-fold
- compare-hierarchy-left-right-circle-node-pill-badge
- compare-swot
- quadrant-quarter-simple-card
- quadrant-quarter-circular
- quadrant-simple-illus
- relation-circle-icon-badge
- relation-circle-circular-progress
- compare-binary-horizontal-badge-card-arrow
- compare-binary-horizontal-underline-text-vs
- hierarchy-tree-tech-style-capsule-item
- hierarchy-tree-curved-line-rounded-rect-node
- hierarchy-tree-tech-style-badge-card
- hierarchy-structure
- chart-column-simple
- chart-bar-plain-text
- chart-line-plain-text
- chart-pie-plain-text
- chart-pie-compact-card
- chart-pie-donut-plain-text
- chart-pie-donut-pill-badge
- chart-wordcloud
- list-grid-badge-card
- list-grid-candy-card-lite
- list-grid-ribbon-card
- list-row-horizontal-icon-arrow
- list-row-simple-illus
- list-sector-plain-text
- list-column-done-list
- list-column-vertical-icon-arrow
- list-column-simple-vertical-arrow
- list-zigzag-down-compact-card
- list-zigzag-down-simple
- list-zigzag-up-compact-card
- list-zigzag-up-simple

## 生成流程

1. 提取用户内容中的标题、描述、条目与层级关系
2. 匹配结构类型并选模板（优先选 my-blog 已收录模板）
3. 组织 `data.items`：每项至少 `label`，按需补 `desc` / `value` / `icon`
4. **默认不写 `themeConfig`**——除非用户明确要换主题/配色
5. 输出唯一一个 ```infographic 代码块

## 输出格式

只输出一个 ```infographic 代码块，body 是 YAML，不添加任何解释性文字：

````markdown
```infographic
template: list-zigzag
data:
  title: 标题
  desc: 描述
  items:
    - label: 条目
      value: 12.5
      desc: 说明
      icon: mdi/rocket-launch
```
````

## 常见问题与最佳实践

- **信息不足时**可合理补全，但避免编造与主题无关内容
- `value` 必须是数值类型；若无明确数值则省略字段
- `children` 用于层级结构，避免层级深度与模板类型不匹配
- YAML 缩进必须用空格（2 空格）；tab 会报错
- 字符串里如有冒号、引号、井号等 YAML 特殊字符，用单引号或双引号包起来
- **不要重复写玻璃风 themeConfig**——plugin 自动注入。重写反而覆盖默认
- 如果模板渲染失败（错误信息会出现在 `.infographic-error` figure 里），优先换 my-blog `built-in.ts` 里的同类模板
