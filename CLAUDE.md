# CLAUDE.md

> 个人博客（中文，二次元玻璃风）。Astro 6 + GitHub Pages + GitHub Actions。

本文是项目编码规范。新功能、新组件、新博文都从这里出发；遇冲突以本文为准。

## Project Overview

静态个人博客，承载「项目分享 / 技术笔记 / 学习总结 / 生活随笔 / 碎碎念」五类内容。整站零后端，pagefind 静态全文检索 + giscus 评论。设计语言是「二次元米哈游系 + 毛玻璃」。

## 核心工程原则

### 1. 结果先验证再交付
任何 UI 改动必须本地 `npm run build` 通过后再 push；视觉差异提醒用户 `Ctrl+Shift+R` 强刷。

### 2. 平台原生优先
能用 HTML/CSS 解决就别上 JS，能用 SVG 就别用 emoji，能用 GitHub Actions 默认能力就别引第三方。

### 3. 无依赖增长（Supply-chain 警觉）
装任何新 npm 包前必须过 §「供应链审查」清单——拒绝 obfuscated 代码、拒绝可疑 install hook、拒绝强制非主流 runtime。

### 4. 三次出现才抽象
两处相似 = 巧合，三处 = 提取共享。`@keyframes` / 工具函数 / 组件均按此节奏。

### 5. 可降级
触屏跳过 hover 动画、`prefers-reduced-motion: reduce` 跳过所有动效、慢网下 LQIP 立即可见、JS 失败时 markdown 内容仍可读。

### 6. 单一职责 + 跨组件用 body class 协调
组件做一件事；多组件联动用 `body.has-toc / body.header-hidden / body.drawer-open` 这类全局 class，**不要** prop drilling 也不要全局事件总线。

## IMPORTANT Guidelines

- **build 验证**：UI 改动必跑 `npm run build`，再 commit + push
- **强刷提醒**：视觉变化通知用户 Ctrl+Shift+R（默认刷新对图片/字体不奏效）
- **不加 emoji 到代码或文档**；UI 上要可爱才能加（且要可降级）
- **不加 `Co-Authored-By: Claude`** 到 commit message，除非明确要求
- **改完 CLAUDE.md 同步 README.md**——两份保持一致
- **`backups/`、`cms/node_modules/` 已 .gitignore**，别 commit

## 开发命令

```powershell
# 写作
npm run cli              # 一站式 CLI 菜单：新建/备份/还原/列表/清理
npm run new              # 仅新建一篇博文（CLI 菜单的「新建」也走它）
npm run cms              # 本地浏览器 CMS（端口 4322，仅 localhost 可访问）

# 开发
npm run dev              # http://localhost:4321/
npm run build            # 生产构建到 dist/（prebuild 自动重生 lqip.json）
npm run preview          # 本地预览构建产物

# 资源
npm run refresh-og              # 抓 friends.json 的 OG meta（--force 全量重抓）
node scripts/gen-favicon.mjs    # 重新生成 favicon
node scripts/crop-hero.mjs      # 预裁竖图为脸居中横版

# 部署
git push                                                       # 推送即触发 GitHub Actions（~40-50s）
gh run list --workflow "Deploy to GitHub Pages" --limit 1      # 查最新部署状态
```

## 技术栈

- **Astro 6**（要求 Node ≥ 22）
- **Markdown / MDX** 双源，共享同一份 `remarkPlugins`
- **Pagefind** 静态全文搜索
- **giscus** 评论（GitHub Discussions + 自定义玻璃主题）
- **Mermaid** 客户端 lazy load 图表
- **APlayer + MetingJS** 网易云歌单
- **LXGW WenKai Screen** 中文字体（jsDelivr CDN）
- **sharp** 图片处理（hero 裁剪 + LQIP）

## 目录结构

```text
stardust/
├── public/                    # 静态资源（直接拷到根路径）
│   ├── favicon-*.png          # 多尺寸 favicon
│   ├── giscus-theme.css       # 评论自定义主题（生产用）
│   └── memories/              # 回忆相册图片
├── src/
│   ├── assets/                # Vite 打包资源（自动 hash）
│   │   ├── bg.jpg             # 全屏背景图
│   │   ├── elysia.png         # favicon 源图
│   │   └── blog/              # 博文 hero 图（按 slug 命名）
│   ├── components/            # 可复用组件
│   ├── content/blog/          # 博文（.md / .mdx）
│   ├── content.config.ts      # 博文 schema
│   ├── layouts/BlogPost.astro # 文章布局
│   ├── pages/                 # 路由
│   ├── data/                  # 数据 JSON（friends / memories / og-cache / lqip）
│   ├── styles/global.css      # 全局样式 + CSS 变量
│   ├── utils/                 # 工具函数
│   └── consts.ts              # 站点常量
├── plugins/                   # remark 插件
├── scripts/                   # 构建/工具脚本
│   └── lib/backup.mjs         # 备份/还原核心
├── cms/                       # 本地浏览器 CMS 子项目
├── backups/                   # 本地备份目录（.gitignore）
└── astro.config.mjs
```

## 编码规范

### CSS 总则

| 规则 | 写法 |
|------|------|
| **响应式四档断点** | `≤640 移动` / `641-960 平板` / `961-1280 桌面（默认）` / `>1280, ≥1400, ≥1800 大屏` |
| **宽度** | `width: min(Npx, 100% - 2em)`——不要 `width + max-width` 双写 |
| **盒模型** | 全局 `*, *::before, *::after { box-sizing: border-box }` |
| **字号** | 主体 `clamp(16px, 0.6vw + 14px, 20px)`；hero/标题 `clamp(1.8em, 4vw + 1em, 2.8em)` |
| **Grid auto-fit** | 永远用 `minmax(min(Npx, 100%), 1fr)`，不要直接 `minmax(Npx, 1fr)` |
| **滚动同步** | 用 `transform: translateY()`，不用 `top` / `left`（前者走 GPU，后者触发 layout 重排） |
| **tap-highlight** | 全局 `-webkit-tap-highlight-color: transparent` |
| **滚动条配色** | Firefox `scrollbar-color` + Webkit `::-webkit-scrollbar-*`，水蓝 `#66CCFF` |
| **不允许新增断点** | 只用上面四档 + 720 给汉堡菜单触发 |

### 玻璃风视觉系统

CSS 变量统一定义在 `:root`（[src/styles/global.css](src/styles/global.css)）：

```css
--glass-bg: rgba(255, 255, 255, 0.55);
--glass-border: 1px solid rgba(255, 255, 255, 0.45);
--glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
--glass-blur: blur(18px) saturate(180%);
```

- 用 `backdrop-filter` 时**必须**同写 `-webkit-backdrop-filter`（Safari）
- 主题色：accent 蓝 `#2337ff` / 强调粉 `#ff5d8f` / 滚动条水蓝 `#66CCFF`
- 中性灰按钮底 `rgba(0,0,0,0.04)`，hover 染主题色

### 字体

- 用 **LXGW WenKai Screen**，jsDelivr CDN 按字符 chunk 加载
- `body` 字体链：`'LXGW WenKai Screen', 'LXGW WenKai', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`
- 不要加 Atkinson 等英文字体——对中文无效

### 背景图

- 源图放 `src/assets/bg.jpg`，CSS 用 `url('../assets/bg.jpg')` 让 Vite 打包
- **必须**用独立 `BgLayer.astro` 组件渲染——挂到 body 上会被祖先 `backdrop-filter` 冻结
- 视差：scroll 进度同步到 `--bg-y`，由 `BgScrollSync.astro` 用 `requestAnimationFrame` 节流

### 图标

- 全部用 inline SVG，**不用 emoji**（emoji 跨 OS 渲染不一致）
- SVG 尺寸**写 HTML 属性**：`<svg width="22" height="22">`，不靠 CSS（Astro scoped CSS 跨边界有 bug）
- 容器统一 40px 圆按钮 + `flex-shrink: 0` 兜底
- 颜色用 `fill="currentColor"`，CSS 改 `color` 控制
- 社交链接（GitHub / 哔哩哔哩 / X / 邮箱等）在 [Header.astro](src/components/Header.astro) 与 [Footer.astro](src/components/Footer.astro) 内 hardcoded inline SVG `<a>`，不走数据文件——改链接 / 加平台直接编辑这两个组件

### 动画与无障碍

任何视觉动画必须有两道守卫：

```js
if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;       // 触屏跳过
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;        // 减少动画偏好跳过
```

CSS 等价：

```css
@media (prefers-reduced-motion: reduce) {
  .my-anim { animation: none !important; }
}
```

### 共享 keyframes

复用 ≥ 3 处的动画定义在 [src/styles/global.css](src/styles/global.css)：
- `avatar-wiggle`（首页 / 关于 / sidebar 头像）
- `card-wiggle`（博文卡片 hover）
- 调用处只写 `:hover { animation: name 0.5s ease }` + reduced-motion 守卫

## 关键陷阱（必避）

这些是 Astro / 玻璃风 / 滚动动画组合下的硬约束，违反会出可见 bug。

### 1. `backdrop-filter` 祖先 → `position: fixed` 后代退化

`backdrop-filter / transform / filter / will-change` 都会创建 containing block。任何在 `.prose`（带 backdrop-filter）内部的 `position: fixed` 元素**实际上变成 absolute**，被 .prose 限制。

**修法**：fullscreen 代码块 / lightbox 必须 JS portal 到 `document.body` 直接子级；退出时用 anchor comment 找回原位。

### 2. Page-scoped CSS 不下钻子组件

Astro 6 给 page 的选择器加 `[data-astro-cid-PAGE]`，子组件渲染的元素只带**子组件的 cid**，page 的 scoped 规则匹配失败。

**修法（优先级递减）**：
1. `:global(.card-media img)` 包后代选择器（最小改动）
2. 样式搬进子组件 `<style is:global>`
3. 子组件接 `class` prop 透传

### 3. Inline script 必须包 DOMContentLoaded

`<script is:inline>` 在 HTML 解析到该位置时立即执行——`.prose` / TOC 等后续元素此时还未渲染。

```js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

### 4. `.md` 和 `.mdx` 共享 remarkPlugins

`astro.config.mjs` 顶层 `markdown.remarkPlugins` **只影响 `.md`**。`.mdx` 走 mdx integration 自己的配置。

```js
const remarkPlugins = [remarkDirective, remarkShokaDirectives, ...];
export default defineConfig({
  integrations: [mdx({ remarkPlugins })],   // ← .mdx 用这个
  markdown: { remarkPlugins },              // ← .md 用这个
});
```

### 5. CSS 特异性陷阱

相同特异性按源序后写赢。想覆盖通用规则必须显式提高一档：

```css
nav a:hover { color: var(--accent); }
nav h2 a:hover { color: var(--black); }   /* (0,1,2) 胜 (0,1,1) */
```

### 6. `align-items: center` 父 + 内部高列表

列表会被居中导致 translateY 数学错乱。必须用内层 `.window` 包裹 + `position: absolute` 列表，绝对定位不受 align-items 影响。

### 7. CSS max-height vs JS height

JS 接管尺寸时**删掉 CSS 的 max-height fallback**——viewport 小时 CSS max 会赢，JS 失效。

### 8. shiki 主题

`astro.config.mjs` 必须设 `markdown.shikiConfig.theme: 'github-light'`。默认 `github-dark` 在玻璃白底反差太大。

### 9. Mermaid 文本/标签必须双引号包裹

Mermaid parser 对裸文本敏感——`from` / `to` / `end` / `class` / `graph` 等常见词在不同 diagram 类型里是保留字，撞上会渲染成「炸弹图 + Syntax error in text」。

**规则**：节点文本和关系 label 一律用双引号包，无论看起来是否「无害」：

```mermaid
flowchart TB
    A["开始"] --> B["处理"]
erDiagram
    projects ||--o{ modules : "has"
    modules  ||--o{ module_relations : "from_module"
```

不要写 `A[开始]` 或 `: from`——前者大多数情况能过但偶发踩中保留字；后者必炸。

同 entity-pair 多关系（如 `modules → module_relations` 画两条）必须用不同 label 区分，且 label 必须 quoted。

## 组件设计规范

### 命名与组织

- 组件：PascalCase（`HeroImage.astro`）
- 工具脚本：kebab-case（`crop-hero.mjs`）
- CSS 类：kebab-case，用 `is-*` 前缀表状态（`is-collapsed` / `is-hidden`）
- 跨组件协调用 body class（`has-toc` / `header-hidden` / `drawer-open`），不用全局事件

### 客户端 JS 守则

- 所有 scroll 监听必须 `requestAnimationFrame` 节流，不用 `setTimeout` / `debounce`
- 拖拽 / 缩放等高频事件用 `transform` 跟随，不改 `top` / `left`
- 长动画必须有 `prefers-reduced-motion` 守卫
- 触屏检测后跳过 hover-only 效果（拖尾、tilt、wiggle）

### Astro inline script 规范

- 用 `<script is:inline>` 加载客户端独占代码（pagefind / mermaid lazy import）
- 必须包 `DOMContentLoaded` 守护
- 监听 `astro:page-load` 处理 SPA 式跳转（如启用 View Transitions）

### 抽屉 / 浮层四件套

任何可关闭浮层（drawer、search overlay、lightbox）必须支持：

1. × 按钮关闭
2. backdrop 点击关闭
3. `ESC` 关闭
4. 内部 `<a>` 点击关闭（drawer）/ 工具栏关闭按钮（lightbox）

a11y 三件套必备：`aria-expanded` / `aria-hidden` / `aria-controls`。开启时给 body 加 `drawer-open` 类锁滚动。

## 内容写作规范

### Frontmatter

最小字段（schema 见 [src/content.config.ts](src/content.config.ts)）：

```yaml
title: '...'
description: '...'             # 30 字内
pubDate: 'May 14 2026'         # 英文日期格式
category: '项目分享'             # 5 选 1：项目分享/技术笔记/学习总结/生活随笔/碎碎念
tags: ['标签1', '标签2']
featured: true                 # 可选，置顶
heroImage: '../../assets/blog/<slug>.jpg'  # 可选
updatedDate: 'May 14 2026'     # 可选
```

### Markdown 扩展

| 语法 | 用途 |
|------|------|
| `:::info / :::tip / :::warning / :::danger` | 四色 callout |
| `:::spoiler` | 剧透块，默认隐藏 |
| `:::fold[标题]` | 折叠块（原生 `<details>`） |
| ` ```mermaid ` | 客户端渲染图表（lang 必须是 `mermaid`） |
| `![alt](src)` 独占一段且 alt 非空 | 自动转 `<figure>` + figcaption + lightbox |
| 一行只有一个裸 URL | 自动转 OG 链接卡（数据源 `og-cache.json`） |

### Hero 图

- 横版源图 + alt 非空 → 拖到 `src/assets/blog/<slug>.jpg`
- 竖版人像源图 → 先跑 `node scripts/crop-hero.mjs`（数组内编辑文件列表）预裁为脸居中横版
- prebuild 自动重生 `lqip.json`，无需手动跑
- **不要**用 `position="top"` 或 `position="attention"`——前者切头，后者被装饰物吸引跳过脸

### 二次元图片源

- **Safebooru** 是主力（JSON API：`https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=...&json=1`）
- 黄金 tag 组合：`1girl + solo + upper_body + looking_at_viewer + smile`
- 必加排除：`-from_behind -from_side -1boy -character_name -sample_watermark -comic -happy_birthday`
- **下载后必须用 Read 工具实际看一眼**——LLM 基于 tag 推断常常出错（侧脸 / 背影 / 水印）

### 文案语言

- **审美**：二次元/anime 风，米哈游系（崩坏3 / 原神）水彩透亮系。**拒绝写实摄影、拒绝过度严肃的设计**
- **人物图必须露脸**，不接受侧脸 / 背影 / 水印图
- **「休闲」优先**，避免商务 / 严肃 / 工作场景
- 中文为主；代码注释 / PR title / 英文场景写英文
- UI 文案套人格招牌句式（如「如你所见」「悄悄告诉你哦」「不是吗？」+ 自然意象）

## 供应链审查

**装任何新 npm 包前必跑清单**：

```bash
grep -E 'preinstall|postinstall' node_modules/<pkg>/package.json
```

否决条件（满足任一直接 reject）：
1. install hook 脚本 ≥ 50 行且看不懂内容
2. obfuscated 代码（变量名形如 `_0x1234`，单文件几百 KB）
3. 强制非主流 runtime（bun-only / deno-only）
4. install hook 内出现 `crypto` + `fetch` 组合（大概率 phone-home）
5. 包大小与功能严重不匹配

需要某个被拒包的能力 → clone 源码自己 build，绕开 npm 分发版的 install hook。

## 工作流

### 新博文（三入口）

```powershell
# A. CLI 菜单（推荐——可顺手备份/还原）
npm run cli

# B. 仅 scaffold
npm run new

# C. 浏览器写作
npm run cms          # 端口 4322，首次自动 npm install cms/
```

后续：加 hero 图 → `git push` → 等 GitHub Actions ~40s。

### 友链 + OG 缓存

```powershell
# 1. 编辑 src/data/friends.json：
#    { "name": "...", "url": "https://...", "description": "...", "accent": "#hex" }

# 2. 抓 OG meta
npm run refresh-og           # 增量：仅未缓存或 failed
npm run refresh-og --force   # 全量重抓

# 3. 一起 commit friends.json + og-cache.json
```

约束：
- `refresh-og` **不**链入 prebuild——CI 不上网，build 永不被网络波动阻塞
- 加新友链后**必须本地跑过** `refresh-og` 再 push
- OG 抓不到 → fallback 字母 tile，不会断图

### 备份还原

`npm run cli` 走入。两种粒度：

| 模式 | 内容 | 体积 |
|------|------|------|
| **标准** | `src/content/blog` + `src/data` + 几个 config 文件 + CLAUDE.md + package.json | KB 级 |
| **完整** | 标准 + `src/assets/blog` + `bg.jpg` + `elysia.png` + `public/memories` | MB 级 |

实现约束（见 [scripts/lib/backup.mjs](scripts/lib/backup.mjs)）：
- tar.gz 包内嵌 `.backup-manifest-<ts>.json`，还原前可 dry-read
- **还原前必做路径安全校验**：拒绝 `..` / 绝对路径 / null byte（防 zip-slip）
- 修 `BACKUP_ITEMS` 时不许绕开 `validateEntries`
- 默认推荐「先备份当前状态再还原」分支

### 本地 CMS 安全

- 端口 **4322**（避开 Astro dev 的 4321）
- 只绑 `127.0.0.1` + Host 头白名单（`localhost / 127.0.0.1 / [::1]`），外网穿透到 4322 也直接 403
- 完全本地工具，部署 dist/ 不含 cms 代码

### 部署

- 推送到 `main` → GitHub Actions → Ubuntu runner 跑 `npm install` + `npm run build` + pagefind 索引 → 上传 dist/ → 发布到 GitHub Pages
- 约 40-50 秒完成
- Node 22+ 必须显式指定（不是 20）

## 关键文件速查

| 文件 | 作用 |
|------|------|
| `src/consts.ts` | 站点常量 + giscus 配置 |
| `astro.config.mjs` | site URL + integrations + shared remarkPlugins |
| `src/content.config.ts` | 博文 collection schema |
| `src/styles/global.css` | 玻璃变量、字体、颜色、共享 keyframes |
| `src/components/BaseHead.astro` | meta + 字体 CDN + favicon |
| `src/components/Header.astro` | 顶部导航 + 抽屉 + ticker + 自动隐藏 |
| `src/components/Footer.astro` | 底部 + 全局组件挂载点 |
| `src/components/BgLayer.astro` | 独立背景层（必须独立，避开 backdrop-filter 冻结） |
| `src/components/BgScrollSync.astro` | scroll → `--bg-y` 同步 |
| `src/components/TableOfContents.astro` | 文章 TOC（桌面侧栏 / 移动浮 header / FAB） |
| `src/components/SearchOverlay.astro` | 搜索浮窗（Pagefind JS API） |
| `src/components/CursorTrail.astro` | 鼠标拖尾 |
| `src/components/MusicPlayer.astro` | APlayer + MetingJS |
| `src/components/Sidebar.astro` | 博客列表左侧栏 |
| `src/components/HeroImage.astro` | LQIP + Astro Image 包装 |
| `src/components/Comments.astro` | giscus 评论 |
| `src/layouts/BlogPost.astro` | 文章布局 + mermaid / lightbox / 代码块 portal |
| `src/pages/index.astro` | 首页 |
| `src/pages/about.astro` | 关于页 |
| `src/pages/404.astro` | 戏剧版 404 |
| `src/pages/friends.astro` | 友链 |
| `src/pages/memories.astro` | 回忆相册 |
| `src/pages/whiteboard.astro` | 画板 |
| `src/pages/blog/[...page].astro` | 博客列表 |
| `src/pages/blog/[...slug].astro` | 单篇文章 |
| `src/data/friends.json` | 友链数据 |
| `src/data/og-cache.json` | OG meta 缓存（commit 进 git） |
| `src/data/lqip.json` | LQIP 占位（prebuild 自动重生） |
| `src/data/memories.json` | 回忆数据 |
| `plugins/remark-shoka-directives.mjs` | `:::info/tip/warning/danger/spoiler/fold` |
| `plugins/remark-mermaid.mjs` | mermaid 代码块包装 |
| `plugins/remark-figure.mjs` | 段落图转 figure + figcaption |
| `plugins/remark-link-card.mjs` | 裸 URL 转 OG 链接卡 |
| `scripts/blog-cli.mjs` | CLI 菜单（npm run cli） |
| `scripts/new-post.mjs` | 新建博文 scaffold |
| `scripts/run-cms.mjs` | 启动浏览器 CMS |
| `scripts/refresh-og.mjs` | 抓 OG meta |
| `scripts/gen-lqip.mjs` | LQIP 生成（prebuild 跑） |
| `scripts/gen-favicon.mjs` | favicon 生成 |
| `scripts/crop-hero.mjs` | 竖图预裁脸居中 |
| `scripts/lib/backup.mjs` | 备份/还原核心 |
| `cms/` | 本地浏览器 CMS 子项目 |
| `backups/` | 本地备份目录（.gitignore） |
| `public/giscus-theme.css` | giscus 自定义主题 |
| `public/memories/` | 回忆图片目录 |
| `.github/workflows/deploy.yml` | GitHub Actions 部署 |

## 自定义入口速查

| 想改什么 | 改哪里 |
|----------|--------|
| 站点标题/描述 | `src/consts.ts` |
| giscus 仓库/分类 ID | `src/consts.ts` 的 `GISCUS` 常量 |
| giscus 主题配色 | `public/giscus-theme.css` |
| 玻璃透明度/边框/阴影 | `src/styles/global.css` 的 `:root` 里 `--glass-*` |
| 滚动条颜色 | `src/styles/global.css` 搜 `#66CCFF` |
| 头像 wiggle 强度 | `global.css` 的 `@keyframes avatar-wiggle` |
| 背景图 | 替换 `src/assets/bg.jpg` |
| favicon | 替换 `src/assets/elysia.png`，跑 `gen-favicon.mjs` |
| 音乐歌单 | `src/components/MusicPlayer.astro` 的 `playlistId` |
| 友链卡 accent fallback | `src/pages/friends.astro` 顶部 `pickThumb` |
| Mermaid 主题色 | `src/layouts/BlogPost.astro` 末尾 `mermaid.initialize` |
| 代码块 macOS 窗口配色 | `global.css` 的 `pre.astro-code` 段 |
| Shoka callout 配色 | `global.css` 的 `.prose .callout-*` |
| lightbox 工具栏 / 缩放范围 | `BlogPost.astro` 末尾 figure-lightbox 脚本 |
| 鼠标拖尾参数 | `CursorTrail.astro`（colors / MAX / LIFE / throttle） |
| Header 自动隐藏阈值 | `Header.astro` 的 `TOP_LOCK` / `THRESH` |
| 首页打字机短句 | `src/pages/index.astro` 的 `typeLines` |
| 首页 Now 区 | `src/pages/index.astro` 的 `.now-grid` 块 |
| 关于页技术栈 | `src/pages/about.astro` 顶部 `featured` / `stack` |

## Development Checklist

### 开始前
- [ ] 看现有代码有无相似 pattern 可复用
- [ ] 装新包 → 跑供应链审查清单
- [ ] 改 schema / 配置 → 备份当前状态（`npm run cli` → 备份）

### 实现中
- [ ] CSS 用项目约定写法（min() / clamp() / minmax min() / transform）
- [ ] 动画加 `prefers-reduced-motion` + 触屏守卫
- [ ] scroll 监听 `requestAnimationFrame` 节流
- [ ] 跨组件协调用 body class
- [ ] 子组件渲染的元素 → 检查 page-scoped CSS 是否需 `:global()`
- [ ] inline script 包 `DOMContentLoaded`
- [ ] 浮层支持四种关闭路径 + a11y 三件套

### 提交前
- [ ] `npm run build` 通过
- [ ] 视觉改动本地浏览器实测（Chrome + 手机视口）
- [ ] 改过 friends.json → 跑 `refresh-og` 并 commit cache
- [ ] commit 不含 `Co-Authored-By: Claude`（除非要求）
- [ ] CLAUDE.md 同步 README.md

### Push 后
- [ ] `gh run list` 看部署状态
- [ ] 上线 → 通知用户强刷（Ctrl+Shift+R）

## Resources

### 官方文档
- [Astro 6 Docs](https://docs.astro.build/) — Content Collections / Image / Integrations
- [Pagefind](https://pagefind.app/) — 静态全文搜索
- [giscus](https://giscus.app/) — GitHub Discussions 评论 + 主题配置器
- [Mermaid](https://mermaid.js.org/) — 客户端图表
- [remark-directive](https://github.com/remarkjs/remark-directive) — Shoka `:::` 语法基础
- [LXGW WenKai Screen](https://github.com/lxgw/LxgwWenKai-Screen) — 字体
- [Safebooru API](https://safebooru.org/index.php?page=help&topic=dapi) — 二次元图源
- [APlayer](https://aplayer.js.org/) + [MetingJS](https://github.com/metowolf/MetingJS) — 音乐播放器
- [sharp](https://sharp.pixelplumbing.com/) — 图片处理（hero 裁剪 + LQIP）

### 灵感参考
- [Shoka theme (Hexo)](https://github.com/amehime/hexo-theme-shoka) — markdown directive 风格来源
- [astro-koharu](https://github.com/cosZone/astro-koharu) — 编码规范结构参考

### 内部关键路径
- 玻璃变量 / 颜色 / 共享 keyframes：[src/styles/global.css](src/styles/global.css)
- 共享 remarkPlugins 注册：[astro.config.mjs](astro.config.mjs)
- 博文 schema：[src/content.config.ts](src/content.config.ts)
- 备份/还原核心：[scripts/lib/backup.mjs](scripts/lib/backup.mjs)
- 本地 CMS 子项目：[cms/](cms/)
