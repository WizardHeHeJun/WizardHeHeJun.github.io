# 博文功能全景

这个 Astro 6 博客的博文（`src/content/blog/*.md`）能用上什么、frontmatter 每个字段触发什么行为、有哪些渐进增强不用手动配置就自动启用。

## Frontmatter 字段

由 `src/content.config.ts` 定义的 schema 校验。**必填**的不填 build 会报错。

| 字段 | 类型 | 必填 | 默认 | 触发什么 |
|------|------|------|------|----------|
| `title` | string | ✓ | — | 博文页 H1、列表卡标题、TOC 顶部、RSS/sitemap/OG meta |
| `description` | string | ✓ | — | meta description（SEO）、列表卡 2 行摘要、OG meta |
| `pubDate` | date (字符串 `'May 14 2026'`) | ✓ | — | 显示发布日期、排序基准（featured 后按此倒序）、`<meta property="article:published_time">` |
| `category` | enum（5 选 1） | — | `'项目分享'` | 博文页底部胶囊链接 → `/categories/{name}/` |
| `tags` | string[] | — | `[]` | 标签胶囊链接 → `/tags/{tag}/`、Pagefind 索引 |
| `featured` | boolean | — | `false` | 列表排序优先（永远在最上）+ 卡片视觉差异化（大卡 + 📌 徽章） |
| `draft` | boolean | — | `false` | `true` 时不出现在已发布列表（仍可作为草稿正常 commit/push） |
| `updatedDate` | date | — | undefined | 有值时博文页显示「最后更新于」时间戳；undefined 时该行完全不渲染 |
| `heroImage` | image（相对路径如 `../../assets/blog/foo.jpg`） | — | undefined | 顶部 hero 图（1020×510）+ 列表卡缩略图（320×200）+ 分类/标签页缩略（300×150）+ LQIP 模糊占位 |

### 5 个分类

| 分类 | 适用 |
|------|------|
| 项目分享 | 自己做的项目（GitHub 项目、技术尝试） |
| 技术笔记 | 技术学习、踩坑、深度笔记 |
| 学习总结 | 读书/课程/集中学习的 takeaway |
| 生活随笔 | 旅行、社交、生活观察 |
| 碎碎念 | 不严肃的小思考、emo、片段 |

模棱两可时优先问用户，不替选。

## Markdown 扩展（正文里能用）

除了标准 GFM markdown 外，本项目通过 remark 插件添加了下面这些扩展：

### Shoka Directives（6 种 callout/容器）

```markdown
:::info / :::tip / :::warning / :::danger
（彩色 callout 块，左侧色条 + 玻璃风背景）

:::spoiler
默认隐藏，click/Enter/Space 解锁
:::

:::fold[可选标题]
原生 <details> 折叠块，无 JS，默认收起
:::
```

详细语法、何时用、反模式见 [shoka-syntax.md](shoka-syntax.md)。

### Mermaid 图表

````markdown
```mermaid
graph TD
  A --> B
```
````

支持约 20 种图类：flowchart / sequenceDiagram / classDiagram / stateDiagram-v2 / pie / mindmap / gitgraph / timeline / quadrantChart / sankey / erDiagram 等。

**自动 lazy load**：博文页只有出现 mermaid 块时才 dynamic import mermaid.js（~700KB），无 mermaid 块的页面零额外负担。

主题已对齐玻璃风（primaryColor 蓝紫调，lineColor 浅蓝）。

详细推荐 + 速例见 [visual-elements.md](visual-elements.md)。

### 自动 Figure + Lightbox

**触发条件**：独立段落里只有一个 `![alt](src)` 且 alt 非空。

**效果**：
- 自动包成 `<figure>` + `<figcaption>`（用 alt 文本作图注）
- 点击图片自动放大（仿 macOS 预览：缩放 / 拖拽 / 工具栏 / ESC 关闭）

**不想 figure 化**：把图放在段落里跟文字混排即可（不独立成段）。

### Link Card（外链 OG 卡）

**触发条件**：独立段落里只有一个裸 URL（如 `https://github.com/...`）。

**效果**：渲染成 OG 预览卡（title + description + favicon + host + 缩略图）。

**数据来源**：`src/data/og-cache.json`，build 时不联网。需要预先跑：
```bash
stardust refresh-og          # 增量抓取未缓存的 URL
stardust refresh-og --force  # 全量重抓
```

抓不到时降级为纯文本链接，不会断图。

### 代码块（macOS 窗口风）

````markdown
```javascript
const x = 42;
```
````

自动渲染成带顶部 36px header bar 的窗口风格：
- 左 3 个红绿黄圆点
- 中 lang 标签
- 右「放大」「复制」按钮（点放大 portal 到全屏、点复制写入剪贴板 + ✓ 反馈）

Shiki 高亮主题：`github-light`。几乎所有主流语言都支持（js/ts/py/sh/rust/go/yaml/json/sql/html/css/...）。

**建议总是写 lang**——lang 标签更清晰、高亮更准。

### Markdown 表格

标准 GFM 表格语法。本项目自动套了样式：
- 表头粉色底 + 字重加粗 + 字距小
- 首列加微底色当行标签
- 列与列之间淡分隔
- 行 hover 高亮（桌面）
- 窄屏自动横向滚动 + 左右边缘渐隐提示

## 自动渐进增强（不用主动配置）

写完博文不用做任何额外配置，下面这些会自动生效：

| 增强 | 行为 |
|------|------|
| **TOC 浮栏** | 扫 `.prose h2, h3` 自动生成目录；桌面左侧 fixed 浮栏（带编号 + scroll-spy），移动顶部胶囊触发 |
| **阅读进度环** | 文章页底部 SVG 环形进度，跟 scroll 联动 |
| **字数 + 阅读时长** | 中文 500 字/分钟，英文 250 词/分钟；标题下方显示 |
| **上下篇导航** | 按 pubDate 排序自动取相邻文章 |
| **giscus 评论** | 底部自动挂载（基于 GitHub Discussions） |
| **Hero LQIP** | 32px base64 模糊占位 + 大图 0.4s 渐显；prebuild 自动重生 `src/data/lqip.json` |
| **OG meta** | 自动生成（用 description + heroImage） |
| **RSS feed** | 自动包含已发布博文 |
| **Sitemap** | 自动生成 `/sitemap-index.xml` |
| **Pagefind 全文索引** | build 时全文扫描，搜索 overlay 可查；正文带 `data-pagefind-body` 标记 |
| **标题自动锚点 id** | h2/h3 自动 slugify 加 id（中文 `[一-龥]` 保留），同名重复加后缀 `-1 -2` |

## 列表 / 索引 / 聚合页对博文的处理

| 页面 | 行为 |
|------|------|
| `/blog/` 列表 | featured=true 永远在最上 → 内部按 pubDate 倒序；每页 6 篇 |
| `/blog/<slug>/` 单篇 | 跑 `[...slug].astro` 路由，自动激活所有渐进增强 |
| `/categories/<name>/` | 按 category 字段聚合，pubDate 倒序 |
| `/tags/<tag>/` | 按 tags 数组聚合（一篇可属多个标签页） |
| 草稿过滤 | draft=true 的不出现在列表 / 分类 / 标签页 |

## 字段 → 影响范围对照

| 字段 | 单篇页 | 列表 | 分类页 | 标签页 | RSS | OG | Pagefind |
|------|--------|------|--------|--------|-----|----|----------| 
| `title` | H1 | 卡标题 | 列表 | 列表 | ✓ | ✓ | 索引 |
| `description` | meta | 2 行摘要 | meta | meta | ✓ | ✓ | 预览 |
| `pubDate` | 显示 + 排序 | 排序 | 排序 | 排序 | ✓ | ✓ | — |
| `updatedDate` | 「最后更新于」 | — | — | — | — | — | — |
| `heroImage` | hero 1020×510 | 卡 320×200 | 缩略 | 缩略 | — | ✓ | — |
| `featured` | — | 置顶 + 📌 + 视觉差异 | — | — | — | — | — |
| `draft` | — | 过滤掉 | 过滤掉 | 过滤掉 | 过滤掉 | — | — |
| `category` | 胶囊 | — | 聚合基准 | — | ✓ 元数据 | — | — |
| `tags` | 胶囊 | — | — | 聚合基准 | ✓ 元数据 | — | 索引 |

## 容易遗漏的功能（基于实际博文样本观察）

这一节是**「特性存在但博文里没怎么用」**的清单，操作怎么做请看 SKILL.md 主流程：

1. **`draft` 字段是个独立工作流**——大部分博文一发布就完结，但写长文 / 中途暂停 / 需要异机继续的场景下，`draft: true` 比 `wip:` commit 干净（线上不显示又能 push）
2. **`updatedDate` 不是必填**——大改老文章时填上才会显示「最后更新于」；改完不填，博文页上没痕迹
3. **`featured` 不只是排序优先**——还触发卡片视觉差异化（大卡 + 暖色 + 📌 徽章），适合教程类 / 重磅项目分享
4. **Hero 图可以省**——但列表卡会空出图位，视觉残破。首篇 / 重要文章建议必传
5. **Link Card 需要预抓 OG**——`src/data/og-cache.json` 是 build 时不联网的；想让裸 URL 渲染成 OG 卡，得先跑 `stardust refresh-og`
6. **代码块「放大」按钮**——所有 ```lang 代码块右上角自带，长代码示例时提醒读者「点这里全屏看」是 nice to have
7. **Mermaid 节点名建议短**——长中文标签（> 15 字）会撑出画布；改英文短词或拆成多张图

## 不在博文范围内的功能（避免混淆）

下面这些是博客**站点级**特性，跟单篇博文 frontmatter 无关：

- **TOC 三档响应式**（桌面浮栏 / 移动胶囊 / 窄屏浮条）—— 自动响应，博文不用配
- **几何鼠标拖尾 / 玻璃风背景 parallax** —— 整站效果，跟博文无关
- **搜索 overlay**（按 `/` 触发）—— Pagefind 自动覆盖博文，不用配
- **画板 / 回忆相册 / 友链** —— 是独立页面，不在博文范畴

写博文时只需关心 frontmatter + 正文 markdown 扩展即可，其他都自动。
