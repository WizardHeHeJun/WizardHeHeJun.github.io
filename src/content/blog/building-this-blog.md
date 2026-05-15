---
title: '我用 Astro + GitHub Pages 搭了这个博客'
description: '从零搭起来的全过程——技术选型、踩过的坑、玻璃风、Pagefind 搜索、音乐播放器、几何鼠标拖尾、parallax 背景、四档响应式 + 移动抽屉 + 嵌入式 ticker + 文章 TOC + Header 自动隐藏……一次 commit 半天的折腾日记。'
pubDate: 'May 14 2026'
updatedDate: 'May 15 2026'
featured: true
heroImage: '../../assets/blog/building-this-blog.jpg'
category: '项目分享'
tags: ['Astro', 'GitHub Pages', '博客', '毛玻璃', 'Pagefind', '霞鹜文楷', '响应式', '移动端', 'TOC']
---

## 为什么要搭博客

很多想法、踩过的坑、灵光乍现的瞬间，如果不写下来就会被时间冲走。比起依赖记忆力对抗遗忘，把它们交给文字更靠谱——这就是有了这个小角落的初衷。

## 选型

短暂调研后定了 **Astro + GitHub Pages + GitHub Actions** 三件套：

- **Astro 6**：静态站点生成器，主打"少 JS、快加载"。适合内容型站点
- **GitHub Pages**：免费托管，对 `<用户名>.github.io` 仓库还有特殊待遇——直接挂在主域名下，无子路径
- **GitHub Actions**：推到 `main` 分支即自动构建部署，全程零运维

对比过 Hugo、WordPress、Hexo——Astro 胜在 Markdown 写作 + 现代主题生态 + 想加 React/Vue/Svelte 组件也无缝。

## 第一阶段：能跑起来

```bash
npx create-astro@latest my-blog --template blog --install --git
```

生成骨架后做的事：

1. **中文化**：`<html lang>` 改 `zh-CN`、日期格式用 `toLocaleDateString('zh-CN')`、导航文案全部换中文
2. **GitHub Actions workflow**：official 版本踩了一个坑——**Astro 6 要求 Node 22+，但 `withastro/action@v3` 默认用 Node 20**，必须显式写 `node-version: 22`
3. **社交图标**：GitHub、哔哩哔哩、X 的 SVG path 直接嵌在 Header / Footer 里
4. **自定义 favicon**：用 `sharp`（Astro 自带依赖）从一张头像生成 16/32/192 + apple-touch 四个尺寸
5. **毛玻璃主题**：全屏背景图 + `backdrop-filter: blur(18px) saturate(180%)`——所有内容卡片透出底层背景

## 第二阶段：从「能用」升级到「好用」

参考了 [xhblog.top](https://xhblog.top)，一次性补齐了 11 个功能（分 8 个 commit 推上去）：

### 内容组织

- **分类系统**：5 个枚举（项目分享 / 技术笔记 / 学习总结 / 生活随笔 / 碎碎念），写在 `content.config.ts` 里强类型校验，写错文件名构建直接挂
- **标签系统**：每篇 3-5 个 tag，自动生成 `/tags/<tag>` 页 + 标签云
- **阅读时长 + 字数**：自己写的 `calcReadingStats(body)` 工具，**中文按字符数 / 500 字一分钟，英文按词数 / 250**——不依赖 `reading-time` 包，因为它只算英文不友好

### UX 升级

- **博客列表卡显示摘要**：用 `description` frontmatter 字段，CSS `-webkit-line-clamp: 2` 限两行
- **侧边栏**：Profile + Stats（实时算 `getCollection` 长度）+ 最近 5 篇文章
- **分页**：`getStaticPaths({ paginate })` + 自定义 Pagination 组件，每页 6 篇
- **戏剧版 404 页**：「**4 [Elysia 头像] 4**」三位一体，浮动动画 + 飘动星星 + 渐变文字
- **友链页**：JSON 数据驱动，附带申请说明

### 重头戏：搜索 + 主题音乐

- **Pagefind 静态搜索**：`astro-pagefind` integration，构建时生成全文索引，**零运维**——比 Algolia / 自建 ES 优雅多了
- **APlayer + MetingJS 音乐播放器**：CDN 加载，固定右下角 mini 模式，默认 ACG 公共歌单，可换网易云任意歌单 ID

### 字体 + 互动小巧思

- **霞鹜文楷 (LXGW WenKai Screen)** via jsDelivr CDN——按字符 chunk 拆分，浏览器只下载页面用到的字符块，不会一次拉 10MB
- **鼠标拖尾**：节流到 28fps，最多 12 个旋转小方块（粉/紫/蓝三色循环），500ms 淡出，**自动跳过触屏设备 + `prefers-reduced-motion`**
- **二级 dropdown**：「分类」「标签」收进「博客 ▾」hover 菜单，主导航更清爽
- **置顶机制**：schema 加 `featured: boolean`，列表排序「featured 优先 → 再按 pubDate 倒序」，列表卡带 📌 置顶徽章

## 第三阶段：精修

参考 [yanbowa.ng](https://yanbowa.ng/) 把首页和关于页都重做成**多 section 玻璃卡**布局，并解决了一些视觉细节：

### 首页改造

- **打字机 hero**：橙色光标 `|` 闪烁，从 11 句**爱莉希雅口吻**问候里随机抽（招牌「如你所见」「悄悄告诉你哦」「不是吗？」+ 飞花、光辉等自然意象）
- **身份 pills**：4 个圆角标签（AI 工程师 / 测试自动化 / 游戏开发 / ACG 爱好者）
- **强调 callout**：橙色胶囊推荐自己的 KNG 项目
- **Now 区**：4 张「现在在干嘛」小卡，工作 / 业余项目 / 在学 / 摸鱼

### 关于页 6 sections

Hero / 👋 你好 / 🛠️ 工具箱 / 🌟 主要项目 / 🎮 日常碎碎念 / 🏠 关于这个站——彻底告别原来「只有一段 lorem ipsum」的官方模板。

### 搜索改成 overlay popover

Header 右上 🔍 不再跳 `/search` 页，改成**点击从 header 下方弹出 460px 浮窗**：
- fade + scale 200ms 动画
- ESC / 点 backdrop / 点 × 关闭，按 `/` 全局打开
- 用 Pagefind JS API 自定义 UI（粉色聚焦输入 + 粉色按钮 + 玻璃结果卡）
- 旧 `/search` 页保留作为 JS 失效时的 fallback

### 背景拆成独立层 + JS parallax slider

这块踩了个**最坑的浏览器 bug**：当 body 用 `background-attachment: fixed` AND 子元素有 `backdrop-filter` 时，浏览器会把 fixed bg 当快照「冻结」，**JS 更新 `background-position` 视觉上不生效**。

修法：把 bg 拆到独立 `<div class="bg-layer">`（`position: fixed; inset: 0; z-index: -10`），不放 body 上。

然后用 JS 把 scroll 进度映射到 CSS var，做出**滑块式 parallax**：
```js
const pct = scrollY / (scrollHeight - innerHeight);
document.body.style.setProperty('--bg-y', `${pct * 100}%`);
```
配合 CSS `background-position: center var(--bg-y)`——页头 = 看图顶，页尾 = 看图底，永远不会拉伸或留白。

### 其他细节

- **Sidebar 从右移到左**：grid `1fr 280px` → `280px 1fr`
- **Footer 全宽底部条**：从浮动小卡片改成贴底全宽
- **首页置顶图智能裁剪**：`Astro <Image>` 的 `position="attention"` 算法对二次元图不准（被白蝴蝶结、装饰物吸引跳过脸）——写了 `scripts/crop-hero.mjs` 用 sharp **预裁竖图为脸居中横版**，再让 Astro 默认 center 裁

## 第四阶段：响应式 + 移动端 UX

桌面看起来一切都美——但浏览器一缩窗口，立刻露馅：导航挤、卡片塌、按钮溢出。这一阶段把整站从「桌面优先 + 一个 720px 兜底」改造成**四档响应式 + 完整移动端形态**。

### 1. 统一四档断点

之前散落在不同文件里的断点（720 / 960 / 1024 各处不一致）整合成：

| 视口 | 名称 | 主要变化 |
|------|------|----------|
| ≤ 640px | 移动 | 单列、drawer、ticker、sidebar 隐藏 |
| 641-960 | 平板/竖屏 | sidebar 折顶部横向 |
| 961-1280 | 桌面（默认） | 双栏完整布局 |
| > 1280 / ≥ 1400 / ≥ 1800 | 大屏 | 内容区解锁更宽（博文列表 1500-1680px） |

**不再发明额外断点**——汉堡菜单触发用 720（和社交图标消失对齐，UX 一致）。

### 2. 用 `min()` 替代 `width + max-width` 双写

旧写法 8 处文件都是：
```css
main { width: 720px; max-width: calc(100% - 2em); }
```

新写法一行搞定：
```css
main { width: min(720px, 100% - 2em); }
```

大屏断点直接覆盖 `width: min(1280px, 100% - 4em)`，不需要 max-width。

### 3. 流式字号 + 全局 box-sizing

`body { font-size: clamp(16px, 0.6vw + 14px, 20px); }`——整站随视口流式缩放，hero 标题用 `font-size: clamp(1.8em, 4vw + 1em, 2.8em)` 防止窄屏顶到边。

最容易遗漏的一条：**全局 `*, *::before, *::after { box-sizing: border-box }`**。没这条手机端 CTA 按钮 `width: 100%` + padding 会溢出父容器——我就被这个 bug 卡了 10 分钟。

### 4. 博客列表卡片重设计

旧布局：双列网格 + 第一项特色大卡（图在上、文在下）。挤、单调、置顶博文只靠 📌 徽章区分不够明显。

新布局参考 [xhblog.top](https://xhblog.top)：

- **全部卡片单列横向堆叠**，每张内部 `display: grid; grid-template-columns: 320px 1fr`
- **奇偶交错**：`:nth-child(even)` 反转图文位置 + `.card-media { order: 2 }`
- **置顶博文独立样式**：grid 改单列、**21:9 全宽大图**、大标题、暖色金边背景、`linear-gradient(135deg, 暖黄, 白)`
- 平板（≤960）：图缩到 220px，奇偶继续交错
- 移动（≤640）：所有卡片图上文下单列堆叠

### 5. 卡片微动效（hover wiggle + active press）

每张博文卡片上加了三个反馈：

- **hover**：卡片 `translateY(-4px)` 上抬 + 阴影变深 + 标题变蓝 + 隐藏的「阅读全文 →」滑入
- **hover 时配图**：一次性 `wiggle` 关键帧动画，5% 放大 + ±1.2° 摇摆，< 0.5s 完成（**不是持续晃**）
- **active**：`transform: scale(0.985)` 轻微下沉反馈，按下立刻知道命中

必须配 `@media (prefers-reduced-motion: reduce) { animation: none }` 守卫——尊重无障碍偏好。

### 6. 移动端 ☰ 抽屉菜单

≤720 隐藏所有 nav 链接，左侧出汉堡按钮，点击从左侧滑出 `min(280px, 80vw)` 宽的抽屉：

- 抽屉里完整菜单 + 可折叠的「博客 → 分类/标签」二级（caret `position: absolute` 浮在右侧，主链接还是居中对齐）
- 关闭路径四种：× 按钮 / 点 backdrop / ESC / 点任意链接
- a11y 三件套：`aria-expanded` / `aria-hidden` / `aria-controls`
- 打开时 `body.drawer-open { overflow: hidden }` 锁滚动

### 7. 移动端 nav 嵌入式 ticker

抽屉解决了导航，但 sidebar 在 ≤640 隐藏后「最近文章」入口也没了。解法：**把最近文章做成嵌入式胶囊 ticker** 挂在 nav 中间（替代站名位置）。

- 玻璃胶囊样式（`border-radius: 999px` + inset 高光 + 下方阴影 + backdrop-blur），像独立悬浮层
- 左侧 6px 脉动小圆点（不用 emoji，更克制）
- 5 篇最新 + 1 篇尾部复制 = 6 个 li，translateY 每步 `-100/6 ≈ -16.667%`
- 每项停留约 4s，切换 1s，单项可点击跳转

### 8. Sidebar 三段行为

最终：

| 视口 | Sidebar |
|------|---------|
| > 960 | 左侧 280-300px 双栏 |
| 641-960 | 折顶部 `auto-fit minmax(220px, 1fr)` 横向 3 卡 |
| ≤ 640 | 完全隐藏（已被 ticker 替代） |

### 9. 文章正文宽度上限

`.prose` 从 720px 加宽到 840px（≥1400 时 960px）。但**不超过 960px**——中文阅读舒适宽度上限，再宽眼睛跟不上行。需要充分利用大屏空间的话，做 TOC 侧栏而不是把正文撑宽。

## 第五阶段：文章阅读体验

桌面端文章打开后，光秃秃的正文加上 hero 图占满屏，**长文章用户没法跳读**。这一阶段补了 TOC + Header 自动隐藏 + 视觉一致性，专治阅读体验。

### 1. 文章 TOC 目录（核心）

参考 [xhblog.top](https://xhblog.top/blog/post/47/)。需求拆解：

- 桌面 ≥1280：左侧贴边的固定栏，跟随 hero 释放到吸顶
- 移动 ≤640：浮入 header 替代 ticker 位置（窄屏 ticker 没空间）
- 全屏宽度上：scroll-spy 高亮当前节、点击平滑跳转
- 右下角 FAB：「回到顶部 / 滚到底部 / × 折叠」

**取标题的姿势**：不用 Astro 的 `headings` API（layout 拿不到），改成客户端 `document.querySelectorAll('.prose h2, .prose h3')`。中文 slugify 用 `replace(/[^\w一-龥\s-]/g, '')`。

**编号**：h2 = `1.`、`2.`、… ，h3 = `1.1`、`1.2`、…

**主动态高亮**：粉色渐变胶囊 + 右侧 5px 小圆点。`#c2185b` 配色。

**桌面端跟随 hero 的动效**：未滚出 hero 时 TOC 贴在 hero 底部 + 20px；滚出后吸顶 80px。
```js
const top = Math.max(stickyTop, heroRect.bottom + 20);
desktop.style.transform = `translateY(${top}px)`;
```

**为什么用 `transform` 不用 `top`**：每次 scroll 事件可能数十次回调，**改 `top` 触发 layout 重排**几 ms 一次，叠加 backdrop-filter 直接掉帧。`transform` 走 GPU 合成层 ~1ms。配 `will-change: transform`。

**底部渐变遮罩**：列表滚到底不要硬切，最后 28px 渐变透明：
```css
mask-image: linear-gradient(180deg, black 0%, black calc(100% - 28px), transparent 100%);
```

### 2. TOC 致命陷阱：`<script is:inline>` 执行时机

第一次写完，本地测试 TOC 死活不显示。**原因**：inline script 在 HTML 解析到该标签时**立即执行**——但 TOC 组件渲染在 `.prose` 之前，所以 `querySelector('.prose')` 返回 null，整个脚本 bail。

修法是包 `DOMContentLoaded`：
```js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTOC);
} else {
  initTOC();
}
```

### 3. 移动 TOC 浮入 header：CSS 比 DOM teleport 靠谱

最初想用 JS `insertBefore` 把 toc-mobile 搬进 `<header><nav>`。**结果跑不通**——Astro 渲染后 `document.querySelector('header > nav')` 在某些时序下返回 null，整个搬运失败但没报错。

改用 CSS fixed 强制定位：
```css
@media (max-width: 640px) {
  body.has-toc header .ticker { display: none !important; }
  body.has-toc .toc-mobile {
    position: fixed !important;
    top: 7px; left: 50px; right: 48px;
    z-index: 11;
  }
  /* 跟 header 一起隐藏 */
  body.has-toc.header-hidden .toc-mobile {
    transform: translateY(-160%);
  }
}
```

**body class 联动**：`has-toc` 标记当前页有 TOC（脚本初始化时加）、`header-hidden` 标记 header 被滚动隐藏。CSS 选择器一句 `body.has-toc.header-hidden .toc-mobile` 把三个组件状态串起来——避免 prop drilling。

### 4. Header 自动隐藏

下滑藏 / 上滑现 / 贴顶 80px 内永远显示 / 抽屉打开时强制可见 / 抖动 < 6px 忽略。`requestAnimationFrame` 节流。

同时给 body 加 `header-hidden` 类——让 TOC 等组件能跟着联动（不止 transform 同步隐藏，TOC 桌面端在 header 隐藏时也会从 top:80 上移到 top:20，避免大块空白）。

### 5. 右下角 FAB（floating action buttons）

窄屏专用（桌面 TOC sidebar 内置同样按钮）。三个按钮：

- ↑ 回到顶部
- ↓ 滚到底部
- × 折叠手柄（**不是删除**）

点 × 让 scroll 按钮 `scale(0)` + `margin-top: -56px` 塌缩布局，× 缩成 40×40 粉色小手柄、图标换成 ☰。再点回弹。

### 6. 统一图标按钮风格

之前社交链接有的是文字（GitHub / 哔哩哔哩 / X）、有的是 SVG、搜索按钮还是 🔍 emoji。**emoji 在 Windows/Mac/Chrome 渲染都不同**，决定改全 SVG。

最终四处（顶栏 / 抽屉 / sidebar / about）统一同一套规则：

```css
.social-links a {
  width: 40px; height: 40px;
  background: rgba(0, 0, 0, 0.04);   /* 默认中性灰 */
  color: rgb(var(--gray));
  border-radius: 50%;
}
.social-links a:hover {
  background: rgba(35, 55, 255, 0.1);
  color: var(--accent);              /* hover 染主题色 */
  transform: translateY(-2px);
}
```

加了**邮箱链接**（`mailto:`），信封图标占第四位。

### 7. 鼠标拖尾从方块改成几何混搭

从「彩色斜方块」改成空心几何：**菱形 + 三角形 3:1 混搭**（◇ ◇ △ ◇ ◇ △）。三角用 inline SVG（`<polygon stroke="currentColor" fill="none" />`），颜色随 dot 循环；菱形用 CSS border + rotate(45deg) + box-shadow 发光。

为什么三角不能用 box-shadow？SVG 是个矩形 wrapper，box-shadow 会画出矩形 glow 出戏——改用 SVG 的 `filter: drop-shadow()`。

### 8. CSS 特异性陷阱：站名 hover 取消

`nav a:hover` 给所有顶栏链接加 hover 反馈（变色 + 下划线）。**问题**：网站标题 `<h2><a>` 也匹配，hover 也变色——但站名不应该像页签。

直接写 `h2 a:hover` 不管用——和 `nav a:hover` 特异性都是 (0,1,1)，源序后写的赢。

**解法**：用 `nav h2 a:hover`（0,1,2），显式提高一档：
```css
nav a:hover { color: var(--accent); /* ... */ }
nav h2 a:hover {
  color: var(--black);
  border-bottom-color: transparent;
  background: transparent;
}
```

### 9. 首页最近文章用 6 篇（数学最优）

旧实现 3 篇，3 列布局时整齐、2 列布局有 1 篇孤儿。改 4 篇，2 列整齐、3 列又有孤儿。

**6 = LCM(2, 3)**——2 列铺 3 行，3 列铺 2 行，永远整齐填满。设计上"展示得多但又留点神秘"的微妙数字。

### 10. 搜索浮窗居中

旧实现钉在 right: 24px top: 64px，大屏视线要奔波到角落。

改成 flex 居中：
```css
.search-overlay {
  position: fixed; inset: 0;
  display: flex;
  align-items: flex-start;        /* 不竖直居中——结果列表向下展开，浮窗要靠上一点 */
  justify-content: center;
  padding: 12vh 16px 16px;
}
.search-popover { width: min(560px, 100%); }
@media (min-width: 1280px) { .search-popover { width: 640px; } }
@media (min-width: 1800px) { .search-popover { width: 740px; } }
```

## 踩过最坑的 12 件事

1. **PowerShell 不让跑 npm**：Windows 默认禁脚本，`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 解决
2. **PowerShell `--` 参数传递有问题**：`npm create astro@latest -- --template blog ...` 的 flag 传不进去，要用 `npx --yes create-astro@latest ...` 直接调绕开
3. **Astro `<Image>` 自动裁剪会切脸**：竖版人像图被裁成横版时 `position="attention"` 算法会被装饰物吸引跳过脸——最稳的办法是**用 sharp 写个 `crop-hero.mjs` 预裁源图为「脸居中横版」**，再让 Astro 默认 center 裁剪
4. **Pagefind 的 import 在 build 时报 Vite 错**：`/pagefind/pagefind.js` 是构建后生成的，Vite 在构建时找不到——必须用 `<script is:inline>` 包裹动态 import
5. **背景图放 `public/` 还是 `src/assets/`**：选 `src/assets/`，CSS 里写 `url('../assets/bg.jpg')`——Vite 自动打包 + 加哈希，缓存破坏免费送
6. **`background-attachment: fixed` + 子元素 `backdrop-filter` = 视觉冻结**：这是 Chrome/Safari 的已知 quirk。修法是把 bg 从 body 拆到独立 fixed div
7. **`background-size: cover` + `attachment: scroll` + 长 body = 图片巨幅拉伸**：cover 会按 body 总高度算尺寸，长文章把图拉到 5 倍。改用 `attachment: fixed` 让 cover 以视口为参照即可
8. **Pagefind UI 默认组件水土不服**：默认 UI 在中文 placeholder / 翻译都不对，干脆抛弃默认 UI 直接调 `pagefind.search(q)` API 自渲染结果
9. **`width: 100%` + padding 在移动端会溢出父容器**：默认 `box-sizing: content-box` 把 padding 加到 width 外。**全局 `*, *::before, *::after { box-sizing: border-box }`** 必须一开始就写——后期才发现的话要排查整站所有 `width` 用法
10. **flex 父容器 `align-items: center` + 内部高列表 = translateY 数学失效**：列表会被垂直居中在父容器中点，可见窗口落在 list 中段而不是顶部，ticker 会显示「两条叠在一起」或「空白」。**必须用内层 `.window` 包裹列表 + 列表 `position: absolute`**——绝对定位元素不受父级 align-items 影响
11. **CSS `translateY(-100%)` 是相对自身高度，不是相对父容器**：6 个 li × 2.4em 的 list 高 14.4em，`translateY(-100%)` = 移动 14.4em，整列直接出视野。N 个 item 的 ticker 每步应该 `-100/N %`（5+1 复制 → `-16.667%`）
12. **置顶博文只靠徽章不够醒目**：用户一眼扫过会忽略 📌——必须有**布局层面的差异**：单列大图 + 21:9 横幅 + 暖色背景边框，让置顶卡看起来就是「不一样的卡」
13. **`<script is:inline>` 在 HTML 解析到位置时立即执行**：组件渲染顺序决定脚本运行时机——TOC 组件在 `.prose` 之前，`querySelector('.prose')` 返回 null 默默 bail。**必须包 DOMContentLoaded**
14. **scroll 监听改 `top` 触发 layout 重排**：每次 scroll 数十次回调，叠加 `backdrop-filter` 直接掉帧。**用 `transform: translateY()` 走 GPU 合成层** + `will-change: transform`
15. **DOM teleport 不如 CSS fixed 可靠**：Astro 渲染时机 + querySelector 时序不稳，JS 搬运静默失败。能用 CSS `position: fixed + z-index` 解决就别动 DOM
16. **emoji 图标在不同 OS 渲染不一致**：Windows / Mac / Chrome 各画一套——稳定的图标必须 SVG，邮箱链接信封 SVG / 搜索放大镜 SVG / 社交平台 SVG 全套
17. **CSS 相同特异性按源序后写赢**：`h2 a:hover` 想覆盖 `nav a:hover` 不管用——必须显式 `nav h2 a:hover` 提高一档
18. **6 = LCM(2, 3)**：首页最近文章用 6 篇而不是 3/4 篇，`auto-fit` 网格 2 列 / 3 列都能整齐填满

## 未来想加的

- 暗色模式
- Giscus 评论（基于 GitHub Issues，零维护）
- RSS 订阅按钮（feed 已经有了，缺入口）
- 数学公式 / mermaid 图支持
- 文章页阅读进度条（顶部一条 0-100%）

代码全部开源：[github.com/WizardHeHeJun/WizardHeHeJun.github.io](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io)

完整项目结构和自定义指南都在 README 里。如果你也想搭一个，欢迎 fork。

---

> 📝 **更新记录**
> - 2026-05-14 初版：Astro + GitHub Pages + 玻璃风 + favicon + 中文化
> - 2026-05-14 二版：补充 11 个功能升级、首页/关于页改造、5 个踩坑总结
> - 2026-05-14 三版：第三阶段精修（首页 hero / 关于页重构 / 搜索 overlay / 背景独立层 + parallax）+ 踩坑扩到 8 条。**项目工作规范单独沉淀到了 [CLAUDE.md](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io/blob/main/CLAUDE.md)**——未来 AI 协作直接读那个
> - 2026-05-14 四版：**第四阶段「响应式 + 移动端 UX」**——统一四档断点 / `min()` 宽度策略 / `clamp()` 流式字号 / 博客列表横向交错卡片 / hover wiggle + active press 微动效 / ≤720 汉堡抽屉（可折叠二级 + 四种关闭路径）/ ≤640 nav 嵌入式胶囊 ticker（最近文章自动滚动）/ sidebar 三段行为。踩坑扩到 12 条（新增 4 条 CSS bug：box-sizing 溢出、flex align-items 居中破坏 ticker、translateY 百分比相对自身、置顶差异化）
> - 2026-05-15 五版：**第五阶段「文章阅读体验」**——文章 TOC 目录（桌面左侧贴边 fixed 栏 + 移动浮入 header 替代 ticker + 右下角 FAB 折叠手柄）/ Header 自动隐藏（下滑藏/上滑现 + body class 联动）/ 鼠标拖尾换成菱形 + 三角几何混搭 / 统一图标按钮风格（4 处 40px 圆形玻璃按钮 + 邮箱链接）/ 搜索浮窗 flex 居中 + 大屏阶梯加宽 / 首页最近文章 3→6 篇（LCM(2,3) 整齐填充）/ 站名 hover 取消（特异性提升）。踩坑扩到 18 条（新增 6 条：inline script 时序、scroll 监听用 transform、DOM teleport 不如 CSS fixed、emoji 渲染分裂、CSS 特异性源序、6 篇数学最优）
