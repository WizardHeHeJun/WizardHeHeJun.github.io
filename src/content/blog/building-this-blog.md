---
title: 我用 Astro + GitHub Pages 搭了这个博客
description: 从零搭起来的全过程——一次 commit 半天的折腾日记。
pubDate: May 14 2026
updatedDate: May 22 2026
featured: true
heroImage: ../../assets/blog/building-this-blog.jpg
category: 项目分享
tags:
  - Astro
  - GitHub Pages
  - giscus
draft: false
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

![戏剧版 404 页：粉发头像夹在两个 4 中间，水蓝玻璃卡片配「回家看看 / 去博客 / 返回上一页」三按钮，背景飘着星星和飞花](../../assets/blog/building-this-blog/01-404.png)

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

![首页改造后的全景：水蓝玻璃 hero 卡居中，打字机短句「如你所见——你找上了我啦~!」+ 四颗身份 pills + 橙色 KNG 推荐 callout + 两枚 CTA 按钮，顶部 nav 粉色胶囊高亮「首页」](../../assets/blog/building-this-blog/02-home-overview.png)

### 关于页 6 sections

Hero / 👋 你好 / 🛠️ 工具箱 / 🌟 主要项目 / 🎮 日常碎碎念 / 🏠 关于这个站——彻底告别原来「只有一段 lorem ipsum」的官方模板。

![关于页首屏：Hero 玻璃卡片展示头像 + 名字 + 副标题 + 四颗身份 pills + 三栏数据统计「8 / 2 / 33」，下方接「👋 你好」自我介绍 section](../../assets/blog/building-this-blog/03-about-page.png)

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

### 9. 首页最近文章用 6 篇

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

## 第六阶段：评论、互动、个人化

桌面 + 移动 + 阅读体验都打磨好了，但博客缺一个**「让访客留下痕迹」**的入口。同时也意识到——纯静态站点不只是「写文章」的容器，还可以做更多有人情味的功能。这一阶段是最长的一次（一晚上接近 50 个 commit）。

### 1. giscus 评论 + 表情反应

挑评论方案时对比了 Disqus（广告 + 卡）、Utterances（已停更）、Waline（要后端 + DB），最后选 **giscus**——数据存 GitHub Discussions、零后端、自带 emoji 反应、免维护、深绑 GitHub 账号（对开发者博客来说反而是过滤垃圾评论的天然手段）。

**接入流程**：
1. 仓库 Settings → 开 Discussions → 新建 Announcements 分类
2. 装 https://github.com/apps/giscus 授权仓库
3. https://giscus.app 配置器拿 4 个 ID（repo / repoId / category / categoryId）

**封装成 `<Comments>` 组件**：mapping/term/title/hint 都是 props，三个页面（博文 / 关于 / 友链）复用同一份。博文用 `mapping="pathname"`（自动跟 URL），关于/友链用 `mapping="specific" term="page-xxx"`（防止路径变动断关联）。

### 2. 自定义 giscus 玻璃主题

giscus 内置的 light 主题是奶油白底——跟我的水蓝玻璃风格冲突很重。giscus 支持 `data-theme={URL}` 加载自定义 CSS。

写了 [`public/giscus-theme.css`](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io/blob/main/public/giscus-theme.css)：`@import` 官方 light 然后覆盖关键变量 + 强力清扫所有 `.color-bg-*` / `.bg-white` 等 Primer/Tailwind 工具类背景全部透明。输入框、评论卡都改成低 alpha 玻璃 + 细描边。主按钮换成站点粉色渐变。

**踩到的两个坑**：

**坑 A：iframe 内部 `backdrop-filter` 无效**。giscus iframe 是独立渲染上下文，blur 看不到外层博客玻璃卡背后的水色——所以 blur 完全没用，反而让半透明白底显得更死。修法：放弃 blur，纯用极低 alpha（0.08）+ 细描边勾轮廓。

**坑 B：iframe 缓存 theme CSS**。改了 `giscus-theme.css` 重部署，iframe 还在拉旧版。修法：URL 拼 `?v={unix-timestamp}`，每次 build 自动 cache-bust：
```ts
const themeVersion = Math.floor(Date.now() / 1000);
const giscusTheme = `${siteOrigin}/giscus-theme.css?v=${themeVersion}`;
```

**坑 C：giscus 排序 BumpButton 的 DOM 反直觉**。「最早 / 最新」按钮的 active 标记不在 button 自己身上，而是在父 `<li aria-current="true">` 上。选择器要从父级走：`.BtnGroup-item[aria-current="true"] .btn`。

![giscus 自定义玻璃主题成品：标题「留下你的想法吧~」+ 第一条评论卡 + 粉色 like 反应 + 透明输入框 + 粉色发送按钮，整体与博客水蓝玻璃风无缝融合](../../assets/blog/building-this-blog/07-giscus.png)

### 3. 回忆相册

加了一个 `/memories` 页——按日期倒序的图文卡片网格。JSON 数据驱动（`src/data/memories.json`，字段 `image / date / title / description?`），图片直接丢 `public/memories/`，路径写 `/memories/<文件名>`。

每张卡：4:3 封面（hover 1.04× 放大）+ 中文日期 + 标题 + 可选描述。空状态有「等你把第一张照片放进来吧 ✨」占位文案。

设计上故意没用 Astro `<Image>` 处理——这些是「随性记录」的图，不需要 Vite 哈希 + 强制裁剪，原图原貌就好。

### 4. 画板

一个不会保存的 HTML5 Canvas——「随手画几笔，反正离开就消失啦」。工具栏：6 色板 + 自定义颜色 picker + 1-30px 粗细滑块 + 橡皮 toggle + 清空。

**关键技术点**：
- **PointerEvents 统一**鼠标 + 触屏 + 触控笔，一套代码三种输入
- **DPR 自适应**：`canvas.width = rect.width × devicePixelRatio` + `ctx.setTransform(dpr, ...)`——Retina 屏不糊
- **窗口缩放保留笔迹**：用临时 canvas 截图后按新尺寸缩放重绘
- **橡皮用 `globalCompositeOperation = 'destination-out'`**——真正抹掉像素而不是画白色，让底下水色玻璃透出来
- **触屏防滚动**：`touch-action: none` 阻止边画边滑

**清空 confirm 用自定义 modal**，不走原生 `confirm()`——原生弹窗丑且跟站点配色冲突。

![画板页面：粉色胶囊 nav 高亮「画板」+ 副标题「随手画几笔，反正离开就消失啦——不留痕迹的小自由」+ 工具栏（6 色板 + 粗细滑块 + 橡皮 + 清空），下方是水蓝玻璃空白画布等待落笔](../../assets/blog/building-this-blog/09-whiteboard.png)

### 5. 头像 hover wiggle

首页 / 关于 / blog sidebar 三处头像都加了鼠标悬停时一次性 0.6s 摆动（scale 1.08 + 旋转 ±8°/7°/-5°/3° 递减），cubic-bezier 末段 overshoot 给 bounce 感。`@keyframes avatar-wiggle` 抽到 `global.css` 三处复用——避免 `@keyframes` 在三个文件各写一遍。

```css
@keyframes avatar-wiggle {
  0%, 100% { transform: scale(1) rotate(0); }
  15%      { transform: scale(1.08) rotate(-8deg); }
  35%      { transform: scale(1.08) rotate(7deg); }
  55%      { transform: scale(1.08) rotate(-5deg); }
  75%      { transform: scale(1.08) rotate(3deg); }
}
```

必须有 `prefers-reduced-motion: reduce` 守卫。

### 6. 移动 TOC 浮条加阅读进度环

之前文章页移动版 TOC 浮条左侧是个静态的书签图标——改成**实时跟随滚动的粉色圆环**。SVG 两个同心圆（背景灰圆 + 粉色弧），用 `stroke-dasharray` + `stroke-dashoffset` 实现进度填充：

```js
const C = 87.96; // = 2π × 14（r=14 的圆周长）
const progress = scrollY / (scrollHeight - innerHeight);
arc.style.strokeDashoffset = String(C * (1 - progress));
```

配 `transition: stroke-dashoffset 0.15s linear` 让填充顺滑，`requestAnimationFrame` 节流。

### 7. nav 重设计：图标 + 粉色胶囊 active

原来的 nav 是「文字 + 底部 4px 蓝下划线」——太朴素，蓝色下划线跟整体粉色调也不搭。重做：

- 每个页签前加 lucide-style 线性 SVG 图标（房子/铅笔/相框/调色板/链条/i）
- 字号 1em → 1.15em，字重 600
- 选中态：**粉色胶囊填充** + 粉字 + 轻微粉光晕（不再是底部下划线）
- hover：浅粉胶囊填充

页签顺序也微调：「首页 / 画板 / 博客 / 回忆 / 友链 / 关于」——画板紧跟首页（高频互动入口）。

### 8. 自定义滚动条 #66CCFF

水蓝 `#66CCFF` 胶囊滚动条。Firefox `scrollbar-color` + Webkit `::-webkit-scrollbar-thumb` 两套写。thumb 加 `border: 3px solid transparent` + `background-clip: content-box`——视觉上比轨道窄，留呼吸感不贴边。

iOS Safari 不支持自定义 scrollbar（系统级），手机端依旧默认灰，这是平台限制不是 bug。

### 9. 移动端 header 加厚 + 阅读浮条对齐

对比 [xhblog.top](https://xhblog.top)，发现自己 header 在移动端比人家细——光按钮 padding 不够，必须给 header 设 `min-height: 68px` 兜底。

同时把 TOC 浮条左右间距重新算（hamburger 加大后会挤过来）、浮条字号字重提高、文字左对齐紧贴进度环、SVG icon 换成跟主 hamburger 区分开的书签图标——免得用户误把 TOC 浮条当成第二个导航菜单。

### 10. 大屏放宽 + Grid 防溢出

之前所有页面都没有 ≥1400/≥1800 断点——4K 屏上两侧空白浪费。统一加：

| 页面 | 默认 | ≥1400 | ≥1800 |
|---|---|---|---|
| 首页 main | 1080 | 1280 | 1440 |
| 关于 main | 800 | 1000 | 1140 |
| 友链 main | 960 | 1200 | 1360 |
| 回忆 main | 1080 | 1280 | 1440 |
| 画板 main | 1080 | 1400 | 1680 |
| 博文 prose | 840 | 1000 | 1100 |

但放宽 main 引出另一个 bug——**首页「最近写了点啥」3×2 布局会自动变 4 列**。grid 用的是 `auto-fit`，main 一宽就自动多塞列。修法：≥1400 时强制 `grid-template-columns: repeat(3, 1fr)` 锁死 3 列。

更广泛的 grid 溢出问题（窄屏卡片撑出容器）用 **`minmax(min(Npx, 100%), 1fr)`** pattern 统一治：
```css
/* ❌ 窄屏父容器 < 280px 时卡片强撑 280 出框 */
grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
/* ✅ 父容器窄时 min 退化为 100%，乖乖填满 */
grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
```

应用到了 6 处 grid（index `.post-cards`/`.now-grid`、friends、memories、about `.proj-grid`、sidebar、categories）。

### 11. 禁用移动端 tap-highlight + 圆角 focus

iOS Safari / Android Chrome 默认点击会闪一下蓝色方块（`-webkit-tap-highlight-color`），跟所有自定义粉色 active 反馈冲突。全局禁掉：
```css
html { -webkit-tap-highlight-color: transparent; }
```

ticker 里 `<a>` 的 focus 也加 `border-radius: 999px` + `:focus-visible` 用浅粉胶囊填充——避免浏览器默认方框 focus ring 在圆角胶囊里出戏。

## 第八阶段：工具链清理 + 内容瘦身

博客打磨到这个阶段已经"自己用顺手"了。这一阶段主要做了几件不大但攒着没意思的事——改名、收口 CLI、统一移动断点、清掉过时博文。顺手把通用骨架抽出去做了开源模板，那是另一个完整的故事，单写在了文末的链接里。

### 1. 项目正式更名 stardust

博客越改越觉得有些命名带的个人色彩太重——404 页那个「4 [Elysia 头像] 4」、favicon 源图、各处文案 / 评论占位、CLAUDE.md 里的角色名引用。趁这一轮整体重构，统一改成了 **stardust**（星屑）。涉及的位置不少：

- `package.json` 的 `name` 字段
- `src/consts.ts` 的 `SITE_TITLE` 等默认值
- `astro.config.mjs` 的注释
- `scripts/gen-favicon.mjs` 的源图
- README 各处文案 / CLAUDE.md 描述
- 模板里所有占位文字

改名本身不难，难的是**确认改完了**——全局搜一遍 `elysia` 全词大小写都返回 0 才算完成。CMS 页的标题、404 页的装饰文案、social 链接的 alt 文本，这些"看不见的角落"是最容易漏的。

### 2. stardust CLI：从 npm script 散页到子命令风入口

每次开会话总要 `cat package.json` 找命令名——`npm run new-post`？还是 `npm run new`？还是 `npm run blog`？烦了几次之后下定决心重构。

收成 `stardust <sub>` 风格的 CLI 之后，顺带解决了另外两件事：

- **模板化的硬需求**：外部使用者总不能让他们也 `cat package.json` 翻命令——必须有一个明确的入口
- **AI 协作 skill 更好教**：blog-writer skill 要调命令，子命令风（`stardust new`）比 `npm run new` 在 prompt 里读起来更像"工具调用"，对 AI 也更友好


### 3. 移动端断点统一到 640

之前因为汉堡菜单触发用了 720、博客列表卡片在 960、首页 Grid 在 1024，各组件的"移动起点"完全不一致——窗口缩到 700px 时部分组件已经切换抽屉模式，另一部分还在桌面布局，错位很尴尬。

这一轮把所有跟"是否移动端"挂钩的断点统一到 **640**（跟主要 grid 断点对齐）。受影响：

- 博客列表卡片：图上文下 ↔ 横向交错 的切换点
- 抽屉触发：从 720 收紧到 640，跟其他组件对齐
- ticker 显示 / Sidebar 隐藏：本来就是 640，对齐之后顺
- prose 宽度上限：≤640 走单列贴边布局

顺手解决了几个"窗口缩到 700px 时某些组件错位"的边缘 bug。

