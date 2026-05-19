---
name: infographic-creator
description: Create beautiful infographics based on the given text content. Use this when users request creating infographics. 使用场景：信息图、做张图、画图表、infographic、可视化。仅当用户明确要做信息图时触发；适用前提：cwd 在 d:/bot/my-blog。
---

An infographic transforms data, information, and knowledge into perceivable visual language. It combines visual design with data visualization, using intuitive symbols to compress complex information and help audiences quickly understand and remember key points.

`Infographic = Information Structure + Visual Expression`

This skill uses [AntV Infographic](https://infographic.antv.vision/) to generate infographics that ship inside my-blog posts as inline SVG (compiled at build time).

> **my-blog 区别于 koharu**：本项目不输出独立 HTML 文件，也不引用 CDN。最终产物是博文 markdown 里的一段 ```infographic 代码块（YAML body），由 `plugins/remark-infographic.mjs` 在编译期调用 `@antv/infographic/ssr.renderToString` 静态化成 SVG 注入页面。

## SPECs

### my-blog Infographic 代码块语法

用 markdown fenced code block，lang = `infographic`，body 是 **YAML mapping**（不是 koharu 的 indented DSL）。Plugin 把整个 YAML 解析后传给 antv 的 `renderToString(options)`。

最小例子：

````markdown
```infographic
template: list-zigzag
data:
  title: 标题
  desc: 描述
  items:
    - label: 条目 A
      desc: 说明 A
      icon: mdi/rocket-launch
    - label: 条目 B
      desc: 说明 B
      icon: mdi/star
```
````

也支持 lang 第二个 token 作为 template override（YAML 内 `template` 字段优先级更高）：

````markdown
```infographic list-zigzag
data:
  items:
    - label: A
    - label: B
```
````

### 顶层 options 字段（YAML 顶层 key）

- `template` (string, 必需): 模板名，见下方"可用模板"
- `data` (object, 必需): 信息图数据
- `themeConfig` (object, 可选): **不写则自动注入玻璃风 theme**（palette 粉蓝粉橙 + LXGW WenKai 字体）。写了则跳过自动注入
- `width` / `height` (number, 可选): 画布尺寸，默认 800 × 480

### data 字段结构

```ts
interface Data {
  title?: string;
  desc?: string;
  items: ItemDatum[];
  [key: string]: any;
}

interface ItemDatum {
  icon?: string;       // 如 'mdi/rocket-launch'
  label?: string;
  desc?: string;
  value?: number;
  children?: ItemDatum[];  // 层级结构用
  [key: string]: any;
}
```

约束：
- 对比类模板（`compare-*`）必须构建恰好 **两个根节点**，所有对比项作为 children
- `hierarchy-structure` 支持最多 3 层（root -> group -> item），items 顺序即从上到下

### 玻璃风 theme（自动注入，**不要重复写**）

Plugin 在用户未提供 `themeConfig` 时自动注入：

```yaml
colorPrimary: '#2337ff'
palette: ['#2337ff', '#ff5d8f', '#66ccff', '#ffd1e4', '#b8860b']
base:
  text:
    fontFamily: "'LXGW WenKai Screen', 'PingFang SC', 'Microsoft YaHei', sans-serif"
```

**只在用户明确要换主题时才写 `themeConfig`。**默认就是玻璃风，写了反而覆盖。

如果用户要 antv 内置主题（如 dark），写：

```yaml
themeConfig:
  theme: dark
```

如果要手绘风，传 stylize：

```yaml
themeConfig:
  stylize: rough
```

### Icon 资源

继承 antv 体系，icon 字段直接写 Iconify 名（`<collection>/<icon-name>`）：

- `mdi/*` Material Design Icons（最常用）
- `fa/*` Font Awesome
- `bi/*` Bootstrap Icons
- `heroicons/*` Heroicons

浏览：https://icon-sets.iconify.design/

**注意**：插画 (`illus`) 在 SSR 模式下需要 antv 自带；外部 unDraw URL 不一定可用（无运行时 fetch）。优先用 icon。

### 可用模板

以下是 `src/templates/built-in.ts` 当前枚举的模板（同步给 user 查看用）。**最终以 antv 包内 `node_modules/@antv/infographic/lib/templates/` 为准**——antv 升级后新增模板要更新 `built-in.ts` 和此处。

```
chart:      chart-pie-plain-text, chart-pie-compact-card
compare:    compare-quadrant, compare-hierarchy-left-right-circle-node-pill-badge
hierarchy:  hierarchy-mindmap, hierarchy-structure, hierarchy-tree
list:       list-zigzag
relation:   relation-dagre-flow
sequence:   sequence-interaction, sequence-stairs
wordcloud:  word-cloud
```

**模板选择速查**：
- 顺序/步骤 → `sequence-*`
- 列表/要点 → `list-*`
- 二元/SWOT 对比 → `compare-*`
- 树形/层级 → `hierarchy-*`
- 数据图表 → `chart-*`
- 关系流图 → `relation-dagre-flow`
- 词云 → `word-cloud`

如果用户描述了一个 my-blog 当前没列出的 antv 模板（如 `list-row-horizontal-icon-arrow`），直接用——antv 包内可能支持，只是 `built-in.ts` 没收录。先试，渲染失败再换。

## Creation Process

### Step 1: 理解需求

如果用户给的内容足够清楚，直接拆结构（title / desc / items / 层级）。否则反问：
- 你想可视化的内容是什么？
- 偏好哪种结构（时间线？对比？层级？图表？）？
- 有没有指定主题或配色？

**关键规则**：保持用户输入语言。中文输入就用中文 label/desc。

### Step 2: 选模板 + 写 YAML

1. 根据信息结构选模板（参考"模板选择速查"）
2. 用 YAML 组织 `data`，每个 item 至少有 `label`，按需补 `desc` / `value` / `icon`
3. 除非用户指定，**不要写 `themeConfig`**——玻璃风会自动注入
4. 输出一个 ```infographic 代码块给用户

### Step 3: 交付

回答里包含：

1. 一段 ```infographic 代码块（YAML body）
2. 简短说明："把这段贴到博文 markdown 里，build 时会自动渲染成 SVG。"
3. 提示用户可以调整：模板、items、要不要加 `themeConfig`

**不要**：
- 不要写独立的 HTML 文件
- 不要引 CDN script
- 不要写 resource loader（SSR 模式不需要）
- 不要在 YAML 里重复写玻璃风 themeConfig（plugin 会自动注入）

### Example

需求：画一个互联网技术演进时间线

输出：

````markdown
```infographic
template: sequence-stairs
data:
  title: 互联网技术演进
  desc: 从 Web 1.0 到 AI 大模型时代
  items:
    - label: Web 1.0
      desc: Tim Berners-Lee 发布第一个网站，互联网时代开启
      icon: mdi/web
    - label: Web 2.0
      desc: 社交媒体与 UGC 成为主流
      icon: mdi/account-multiple
    - label: Mobile
      desc: iPhone 发布，智能手机改变世界
      icon: mdi/cellphone
    - label: Cloud Native
      desc: 容器化与微服务架构广泛应用
      icon: mdi/cloud
    - label: AI 大模型
      desc: ChatGPT 引爆生成式 AI 革命
      icon: mdi/brain
```
````

提示用户："这段贴到博文 markdown 里就行，玻璃风主题会自动应用。如果要换模板或调内容，告诉我。"

## my-blog 项目特化

- DSL 语法：用 markdown fenced code block，lang = `infographic`，body 是 YAML（不是 koharu 文档里的 indented DSL）
- 玻璃风 theme 自动注入：plugin 在用户没写 `themeConfig` 时自动注入 `palette: [#2337ff, #ff5d8f, #66ccff, #ffd1e4, #b8860b]` + LXGW 字体。**用户写了 themeConfig 则跳过注入**
- 渲染：编译期 `@antv/infographic/ssr.renderToString` 静态化 SVG，零运行时 JS
- 错误降级：YAML 解析错或 antv 报错时输出 `.infographic-error` figure（含原 DSL + 错误信息），build 不挂
- 实现细节见 [plugins/remark-infographic.mjs](../../plugins/remark-infographic.mjs)
