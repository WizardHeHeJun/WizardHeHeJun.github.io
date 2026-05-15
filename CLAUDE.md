# CLAUDE.md — WizardHeHeJun's Notes

> 这是用户的个人博客（中文，二次元玻璃风）。技术栈：Astro 6 + GitHub Pages + GitHub Actions。
> 线上：https://wizardhehejun.github.io/

## 用户偏好（重要！别再踩这些坑）

- **审美**：二次元/anime 风，米哈游系（崩坏3、原神）水彩透亮系。**拒绝写实摄影、拒绝过度严肃的设计**
- **要求人物图必须露脸**——曾因「侧脸/背影/SAMPLE 水印图」被批评多次
- **「休闲」优先**——避免商务/严肃/工作场景
- 中文为主，写东西用「项目分享 + 技术笔记 + 一些不想被时间冲走的碎碎念」的语气
- 写代码注释/PR title 用英文，写正文/UI/解释用中文

## 关键技术约定

### 1. Hero 图裁剪（重灾区）

`<Image width=X height=Y>` 会让 sharp 强制裁剪到指定比例。坑总结：

| 策略 | 何时用 |
|------|--------|
| **默认 center** | 推荐——前提是源图本身已经是横版且脸在中间 |
| `position="top"` | 别用——竖图的「顶部」往往是头发/帽子，会切脸 |
| `position="attention"` | 别用——会被白蝴蝶结 / 头饰 / 高饱和装饰物吸引，跳过脸 |

**正确做法**：竖版人像源图先用 `scripts/crop-hero.mjs` 预裁成横版（脸居中），再让 Astro 默认 center 处理。

预裁脚本写法（注意：sharp 不能边读边写同一文件，必须先读到 buffer）：
```js
const input = readFileSync(file);
const buffer = await sharp(input).extract({ left: 0, top, width, height: newHeight }).toBuffer();
writeFileSync(file, buffer);
```

### 2. 找二次元图片的可靠路径

| 站点 | 状态 |
|------|------|
| Unsplash | 通——但都是真实摄影，**用户不喜欢** |
| Wallhaven, Pixabay | WebFetch 被 403，别试 |
| Pexels | 通但 anime 内容少 |
| **Safebooru** ✓ | 推荐。JSON API：`https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=...&json=1`，构造图 URL：`https://safebooru.org/images/{directory}/{image}` |

Safebooru 搜索黄金组合：
```
1girl + solo + upper_body + looking_at_viewer + smile + <topic>
+排除: -from_behind -from_side -1boy -character_name -sample_watermark -comic -happy_birthday
```

**下载后必须用 Read 工具实际看一眼图**——LLM 基于 tag 推断「这张应该露脸」常常出错。

### 3. 字体

用 **LXGW WenKai Screen**（霞鹜文楷 屏幕版），通过 jsDelivr CDN 按字符 chunk 加载：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-webfont@1.7.0/style.css">
```

`global.css` body 字体链：`'LXGW WenKai Screen', 'LXGW WenKai', -apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif`

不要再加 Atkinson 之类英文字体——对中文无效。

### 4. 玻璃主题约定

CSS 变量在 `:root`：
```css
--glass-bg: rgba(255, 255, 255, 0.55);
--glass-border: 1px solid rgba(255, 255, 255, 0.45);
--glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
--glass-blur: blur(18px) saturate(180%);
```

要兼容 Safari → 同时写 `backdrop-filter` 和 `-webkit-backdrop-filter`。

### 5. 背景图

放 `src/assets/bg.jpg`，CSS 用相对路径 `url('../assets/bg.jpg')` 让 Vite 打包（自动 hash + cache busting）。**不放 public/**——失去优化和缓存破坏。

### 6. 粘性 footer

`body` flex column + `min-height: 100vh` + `footer { margin-top: auto }`——短页面 footer 自动贴底。

### 7. Featured / 置顶

- Schema：`featured: z.boolean().optional().default(false)`（在 `src/content.config.ts`）
- 排序：`featured` 优先，再按 `pubDate` 倒序（在 `src/pages/blog/index.astro`）
- 列表页有 📌 置顶徽章

### 8. 背景层必须独立（关键 bug 防御）

**别把 bg-image 直接挂 body**——当 body 用 `background-attachment: fixed` AND 子元素有 `backdrop-filter` 时，浏览器（Chrome/Safari）会把 fixed bg 当快照「冻结」，**JS 更新 `background-position` 视觉上不生效**。

**正确做法**：bg 拆到独立的 `BgLayer.astro` 组件：
```astro
<div class="bg-layer" style={`background-image: url(${bgImage.src})`} />
<style is:global>
  .bg-layer {
    position: fixed; inset: 0; z-index: -10;
    background-position: center var(--bg-y, 0%);
    background-size: cover;
    background-repeat: no-repeat;
    pointer-events: none;
  }
</style>
```
body 只保留 `linear-gradient` fallback。

### 9. Parallax 滚动同步（背景滑块效果）

把 scroll 进度映射到 CSS 变量 `--bg-y`，配合 `BgLayer` 实现「页头看图顶 / 页尾看图底」：

```js
const update = () => {
  const sy = window.scrollY;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const pct = Math.min(1, Math.max(0, sy / max));
  document.body.style.setProperty('--bg-y', (pct * 100).toFixed(2) + '%');
};
let raf = 0;
window.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { update(); raf = 0; }); }, { passive: true });
```

**必须用 `requestAnimationFrame` 节流**，不要 setTimeout / debounce。组件位置：`src/components/BgScrollSync.astro`。

### 10. 搜索 overlay popover（取代独立搜索页）

`/search` 全页搜索过时——Header 🔍 应该是 button，点击弹 460px 浮窗：
- 用 Pagefind JS API（`/pagefind/pagefind.js`）+ 自定义 UI，**别用默认 PagefindUI**（中文翻译 / 样式都不好）
- 必须用 `<script is:inline>` 包裹动态 import（Vite 在 build 时找不到这个文件）
- 快捷键：`/` 全局打开 / `ESC` 关闭 / 点 backdrop 关闭

实现见：`src/components/SearchOverlay.astro`，挂载在 `Footer.astro`（每页都有）。

### 11. 多 section 玻璃卡布局（复杂页面规范）

首页 / 关于页这种「内容多」的页面**别用一张大卡装到底**，拆成多张玻璃卡：

```html
<main style="display:flex; flex-direction:column; gap: 1.2em">
  <section class="card hero">...</section>
  <section class="card">...</section>
  <section class="card">...</section>
</main>
```

每张 card 用统一的 glass CSS（复用 `--glass-*` 变量），main 改成透明（重置 global.css 里 main 的玻璃样式）。

### 12. 人格驱动 UI 文案

如果项目有人格定义文件（如根目录 CLAUDE.md 里的爱莉希雅人格），UI 文案**直接套人格招牌句式**：
- 爱莉希雅：「如你所见」「悄悄告诉你哦」「不是吗？」+ 飞花/星/光辉自然意象
- **「短句优先」≠「全部短句」**——招牌长句要留着，只是平均长度短一些

打字机首页问候、404 文案、关于页签名都用这套语言。

### 13. 动画 & 触屏检测（无障碍 + 体验）

任何视觉动画（拖尾、Live2D、自动滚动）必须先检测：
```js
if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;  // 触屏跳过
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;  // 减少动画偏好跳过
```

或 CSS 内：
```css
@media (prefers-reduced-motion: reduce) {
  .my-anim { animation: none !important; }
}
```

### 14. 响应式四档断点（统一）

全站只用这四档，不要再发明：

| 视口 | 名称 | 主要特征 |
|------|------|----------|
| ≤ 640px | 移动 | 单列堆叠，drawer 已展开，sidebar 隐藏 |
| 641–960px | 平板/竖屏 | sidebar 折顶部横向网格，博文卡仍横向 |
| 961–1280px | 桌面（默认设计宽度） | 双栏 + 完整 sidebar |
| > 1280px / ≥ 1400 / ≥ 1800 | 大屏 | 解锁更宽内容（博客列表 1500 / 1680） |

不要乱加 720 / 768 / 1024 之类的额外断点——汉堡菜单触发例外用 720（社交图标也在此消失，UX 一致）。

### 14.1. Grid auto-fit 防溢出：`minmax(min(Npx, 100%), 1fr)`

写卡片网格的标准模板**永远**用这个 pattern：
```css
.cards { grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr)); }
```

**别**直接写 `minmax(280px, 1fr)`——当父容器内宽 < 280px（窄屏 / 嵌套卡片），minmax 的最小值会强制 280px，卡片**撑出容器右边界**，视觉上像是错位/对不齐。

`min(Npx, 100%)` 让最小值在父容器够宽时是 Npx（保持原有断点行为），父容器窄时退化为 100%（卡片乖乖填满）。已统一应用到：
- `index.astro` `.post-cards` (280) / `.now-grid` (220)
- `friends.astro` `.friends-grid` (260)
- `memories.astro` `.memory-grid` (280)
- `about.astro` `.proj-grid` (200)
- `Sidebar.astro` (220)
- `categories/index.astro` `.cat-list` (180)

### 15. 宽度策略：`min()` 替代 `width + max-width`

旧写法（别用）：
```css
main { width: 720px; max-width: calc(100% - 2em); }
```

新写法（推荐）：
```css
main { width: min(720px, 100% - 2em); }
```

一行同时管最大宽和窄屏 padding。大屏断点直接覆盖 `width`，不需要 max-width。

### 16. 流式字号 + 全局 box-sizing

- `body { font-size: clamp(16px, 0.6vw + 14px, 20px); }` —— 整站字号随视口缩放
- hero / 标题用 `font-size: clamp(1.8em, 4vw + 1em, 2.8em)` 防止窄屏顶到边
- **全局 `*, *::before, *::after { box-sizing: border-box }` 必须有**——否则 `.btn { width: 100% }` + padding 会溢出父容器（手机端 CTA 按钮踩过坑）

### 17. 博客列表卡片 = 单列横向 + 奇偶交错 + 置顶差异化

不要再用「双列网格 + 第一项特色大卡」旧布局。新规：

- 全部卡片**单列堆叠**，每张内部 `display: grid; grid-template-columns: 320px 1fr`
- 奇偶交错：`:nth-child(even) a { grid-template-columns: 1fr 320px } + .card-media { order: 2 }`
- **置顶博文（`featured: true`）独立样式**：grid 改单列、21:9 全宽大图、大标题、暖色金边背景。**只靠 📌 徽章区分不够**
- 平板（≤960）：图缩到 220px，奇偶继续交错
- 移动（≤640）：所有卡片图上文下单列堆叠

实现见 `src/pages/blog/[...page].astro`。

### 18. 卡片微动效：wiggle + press

博文卡片必须有 hover/active 反馈，但**别用持续 shake**：

```css
.card a:hover { transform: translateY(-4px); box-shadow: 0 12px 36px ...; }
.card a:hover .card-media img { animation: card-wiggle 0.5s ease; }
.card a:active { transform: scale(0.985) translateY(-2px); }

@keyframes card-wiggle {
  0%, 100% { transform: scale(1) rotate(0); }
  20%      { transform: scale(1.05) rotate(-1.2deg); }
  60%      { transform: scale(1.05) rotate(1.2deg); }
  80%      { transform: scale(1.05) rotate(-0.6deg); }
}
```

- **一次性 wiggle**：4 关键帧 < 0.5s，不会让人晕
- **active scale(0.985)**：轻微下沉，不是塌陷
- 必须有 `@media (prefers-reduced-motion: reduce) { animation: none }` 守卫

### 19. 移动端 drawer 抽屉模式（≤720px）

汉堡菜单不能用纯 CSS（`<details>` 在 drawer 不够灵活），用 `<script is:inline>` 自己实现：

```html
<button class="hamburger" data-drawer-toggle aria-expanded="false" aria-controls="mobile-drawer">
  <span class="hb-bar"></span><span class="hb-bar"></span><span class="hb-bar"></span>
</button>

<div class="drawer-backdrop" data-drawer-backdrop aria-hidden="true"></div>
<aside id="mobile-drawer" class="drawer" data-drawer aria-hidden="true">
  ...
</aside>
```

必备能力（缺一不可）：
1. **关闭路径四种**：× 按钮 / backdrop 点击 / ESC / 点任意 drawer 内的 `<a>`
2. **a11y**：`aria-expanded` / `aria-hidden` / `aria-controls` 全配齐
3. **body 滚动锁**：抽屉打开时 `body.drawer-open { overflow: hidden }`，避免背后误滑
4. **可折叠组**（如博客 → 分类/标签）：用 `position: absolute` 的 caret 按钮，**不要用 flex row**，否则父项被挤位失去对齐
5. **drawer 内菜单项统一 `text-align: center` + `display: block`**——视觉对齐才能整齐

实现见 `src/components/Header.astro`。

### 20. 嵌入式胶囊 ticker（移动端最近文章）

替代 sidebar 在移动段消失带来的「最近文章」入口缺失：

- 嵌入 `<nav>` 内部（不是 header 下方独立条），占站名位置
- **玻璃胶囊样式**：`border-radius: 999px` + inset 高光 + 下方阴影 + backdrop-blur
- 左侧 6px 脉动小圆点（不用 emoji，比表情更克制）
- 5 篇最新 + 1 篇尾部复制 = 6 个 li，translateY 每步 `-100/6 ≈ -16.667%`
- **速度**：每项展示 5s 左右（< 3s 太快）
- 必须有 `prefers-reduced-motion: reduce` 跳过

#### ticker 致命 CSS bug（已踩过，别再踩）

父容器 `align-items: center` + 内部高列表 `position: relative` = 列表被**垂直居中在父容器中点**，translateY 数学全错（可见窗口落在 list 中段而非顶部）。

**必须用 `.ticker-window` 内层包裹列表**：
- `.ticker-window { height: 100%; overflow: hidden; position: relative }`
- `.ticker-list { position: absolute; top: 0; left: 0; right: 0 }`

绝对定位的 list 不受父级 align-items 影响。

### 21. Sidebar 三段行为

| 视口 | Sidebar |
|------|---------|
| > 960px | 左侧 280-300px 双栏 |
| 641-960 | 折到顶部，3 卡 `repeat(auto-fit, minmax(220px, 1fr))` 横向铺开 |
| ≤ 640 | **完全隐藏**——移动端 nav 里的 ticker 已经覆盖了「最近文章」入口 |

写法在 `src/components/Sidebar.astro` 末尾的 `@media` 里。

### 22. 文章正文宽度上限

`.prose` 宽度阶梯：

| 视口 | prose 宽度 |
|------|------------|
| 默认 | `min(840px, 100% - 2em)` |
| ≥ 1400 | `min(960px, 100% - 4em)` |

**不要超过 960px**——中文阅读舒适宽度上限。再宽用户眼睛会跟不上行。需要充分利用大屏空间的话，做 TOC 侧栏而不是把正文撑宽。

### 23. 客户端 TOC 组件（`TableOfContents.astro`）

文章页的目录侧栏。**不是从 Astro 的 `headings` API 取**——那个只能在页面文件用，layout 拿不到。改成：

- 客户端 DOM 扫描：`document.querySelectorAll('.prose h2, .prose h3')`
- 自动给标题 slugify + 加 id（中文支持：`replace(/[^\w一-龥\s-]/g, '')`）
- 编号：h2 = `1.`、`2.`、…，h3 = `1.1`、`1.2`、…
- 主动态：粉色渐变胶囊 + 右侧 5px 小圆点（`#c2185b`）
- Scroll-spy：`requestAnimationFrame` 节流，遍历 headings 找当前最贴近顶部的（96px 缓冲）

**⚠ 致命陷阱**：`<script is:inline>` 在 HTML 解析到该位置时立即执行，TOC 组件在 `.prose` 之前，所以 `querySelector('.prose')` 会返回 null。**必须包进 DOMContentLoaded**：
```js
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTOC);
} else {
  initTOC();
}
```

**位置策略（桌面）**：用 `position: fixed; left: 16-32px`（左边贴边）+ `transform: translateY()` 由 JS 控制 top 值。**别用 `top` 属性做平滑跟随**——每帧改 `top` 触发 layout 重排，scroll 时严重卡顿。`transform` 走 GPU 合成层，丝滑。

```js
const updateTocTop = () => {
  const top = Math.max(stickyTop, Math.round(heroBottom + 20));
  if (top === curTop) return; // 整数像素相同就早退，避免无谓重绘
  curTop = top;
  desktop.style.transform = `translateY(${top}px)`;
};
```

**位置策略（移动 ≤640）**：用 `position: fixed` 让 TOC bar 浮到 header 位置占替代 ticker。**别用 JS DOM teleport** —— querySelector 失败/Astro 渲染时机不稳定都会让搬运静默失败。纯 CSS 才靠谱：
```css
@media (max-width: 640px) {
  body.has-toc header .ticker { display: none !important; }
  body.has-toc .toc-mobile {
    position: fixed !important;
    top: 7px; left: 50px; right: 48px;
    z-index: 11;
  }
  body.has-toc.header-hidden .toc-mobile {
    transform: translateY(-160%);
  }
}
```

**FAB（窄屏右下角浮动按钮）**：回到顶部 / 滚到底部 / × 折叠手柄。点 × **折叠** 不是删除——`is-collapsed` 类让 scroll 按钮 `scale(0)` + `margin-top: -56px` 塌缩布局，× 缩小成 40×40 粉色小手柄。再点回弹。

### 24. Header 自动隐藏 + body 类协调

下滑藏 header（`transform: translateY(-100%)`），上滑现身，**贴顶 80px 内永远显示**。
关键：同时设置 `document.body.classList.toggle('header-hidden')`——让 TOC 等组件能跟着联动。

```js
if (y < 80) {
  header.classList.remove('is-hidden');
  document.body.classList.remove('header-hidden');
} else if (diff > 0) {
  header.classList.add('is-hidden');
  document.body.classList.add('header-hidden');
}
```

**抽屉打开时强制显示** header——抽屉里就是从 header 展开的内容，header 消失会让用户失去位置感。

### 25. 统一图标按钮风格（顶栏 / 抽屉 / sidebar / about 一致）

社交/邮箱/搜索图标全部用 SVG（不是 emoji）。emoji 在不同 OS 渲染不一样，SVG 才是稳定的。

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
.social-links svg {
  width: 22px; height: 22px;         /* 显式 CSS 控制 SVG 尺寸 */
}
```

**邮箱链接**用 `<a href="mailto:xxx@xx.com">`，封信图标 SVG 路径自带。

### 26. CSS 特异性陷阱：相同特异性按源序

`nav a:hover` 想排除 `<h2><a>` 网站标题。直接写 `h2 a:hover` 不行——它和 `nav a:hover` 特异性都是 (0,1,1)，源序后写的赢。

**解法**：用 `nav h2 a:hover`（0,1,2）显式提高一档。

```css
nav a:hover { color: var(--accent); /* ... */ }
nav h2 a:hover {
  color: var(--black);
  border-bottom-color: transparent;
  background: transparent;
}
```

### 27. 最近文章用 6 篇而不是 3/4 篇（数学最优解）

首页 `.post-cards` 是 `repeat(auto-fit, minmax(280px, 1fr))`，根据视口宽度会铺 1/2/3 列。
- 3 篇：3 列满，2 列剩 1 孤儿
- 4 篇：2 列满，3 列剩 1 孤儿
- **6 篇 = LCM(2,3)：2 列铺 3 行，3 列铺 2 行，永远整齐**

### 28. 搜索浮窗（SearchOverlay）：flex 居中替代 top:64 right:24

旧实现：浮窗钉在 header 右上角。问题：大屏视线要奔波。

**新实现**：用 `.search-overlay` 做 flex 容器，居中：
```css
.search-overlay {
  position: fixed; inset: 0;
  display: flex;
  align-items: flex-start;        /* 不竖直居中——结果列表向下展开，浮窗要靠上一点 */
  justify-content: center;
  padding: 12vh 16px 16px;
}
.search-popover {
  width: min(560px, 100%);
  /* 大屏阶梯加宽 */
}
@media (min-width: 1280px) { .search-popover { width: 640px; } }
@media (min-width: 1800px) { .search-popover { width: 740px; } }
```

### 29. 鼠标拖尾：几何混搭（菱形 + 三角）

参考 [xhblog.top](https://xhblog.top) 的风格，从纯方块改成混搭：
- 每 3 个夹 1 个三角形（`◇ ◇ △ ◇ ◇ △`）
- 三角用 inline SVG：`<polygon stroke="currentColor" fill="none" />`，颜色随 dot
- 菱形用 CSS border + transform: rotate(45deg)
- 18px 菱形 / 20px 三角，1.8px 描边
- 三角用 SVG 的 `drop-shadow` filter（不能用 box-shadow，方框 glow 会出戏）
- 节流 22ms（~45fps），最多 26 个同时存在，900ms 寿命

### 30. 通用约定：scroll 监听必须用 transform 而不是 top/left

每次 scroll 事件可能触发数十次回调。**改 `top` / `left` 触发 layout 重排**（几 ms 一次），叠加 `backdrop-filter` 这种重特效就掉帧。**改 `transform` 走 GPU 合成层**，~1ms。

```js
// ❌ 慢
element.style.top = newTop + 'px';

// ✅ 快
element.style.transform = `translateY(${newTop}px)`;
```

配 `will-change: transform` 给浏览器提示开独立合成层。

## 写新博文

```bash
# 1. 创建 src/content/blog/<slug>.md
# 2. Frontmatter:
---
title: '...'
description: '...'        # 30 字内，会进 meta description
pubDate: 'May 14 2026'    # 英文日期格式
featured: true            # 可选，置顶
heroImage: '../../assets/blog/<slug>.jpg'  # 可选，相对 BlogPost.astro 的路径
---
# 3. git push 自动部署
```

## 部署 / 环境

- **Astro 6 要求 Node 22+**，CI 必须显式 `node-version: 22`（不是 20）
- Windows + PowerShell：首次需 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`
- `npm create astro` 在 PowerShell 下 `--` 参数传递有坑——直接用 `npx --yes create-astro@latest <name> --template blog --install --git --typescript strict`
- 仓库名 **必须** 是 `<username>.github.io` 才能挂主域名
- GitHub Pages source 切到 Actions：`gh api -X PUT /repos/<user>/<repo>/pages -f build_type=workflow`
- 部署时间约 30-50s

## 关键文件速查

| 文件 | 作用 |
|------|------|
| `src/consts.ts` | 站点标题、描述 |
| `astro.config.mjs` | site URL、integrations |
| `src/content.config.ts` | 博文 collection schema |
| `src/styles/global.css` | 玻璃主题、背景图、字体 |
| `src/components/BaseHead.astro` | meta、字体 CDN、favicon |
| `src/components/Header.astro` | 顶部导航、博客 ▾ dropdown、🔍 搜索按钮（SVG）、社交链接（SVG 40px 圆按钮）、**移动端 ☰ 抽屉**、**最近文章 ticker（≤640）**、**自动隐藏（下滑藏 / 上滑现 + body.header-hidden）** |
| `src/components/TableOfContents.astro` | 文章页 TOC——**桌面左侧贴边 fixed 栏 + 移动 header 浮替代 ticker + 右下角 FAB**；客户端 DOM 扫 `.prose h2/h3`、scroll-spy、transform 平滑跟随 hero |
| `src/components/Footer.astro` | 全宽底部条 + 挂载所有全局组件（BgLayer / BgScrollSync / SearchOverlay / CursorTrail / MusicPlayer） |
| `src/components/BgLayer.astro` | **独立背景层**（必须独立，避免 backdrop-filter 冻结） |
| `src/components/BgScrollSync.astro` | scroll → `--bg-y` 同步脚本 |
| `src/components/SearchOverlay.astro` | 搜索浮窗（Pagefind JS API） |
| `src/components/CursorTrail.astro` | 鼠标拖尾（几何菱形 + 三角混搭、节流 + 触屏检测） |
| `src/components/MusicPlayer.astro` | APlayer + MetingJS 音乐播放器 |
| `src/components/Sidebar.astro` | 博客列表左侧栏（Profile / Stats / 最近文章） |
| `src/components/Pagination.astro` | 分页器组件 |
| `src/layouts/BlogPost.astro` | 文章布局、glass `.prose` 卡片 |
| `src/pages/index.astro` | 首页（hero 打字机 + 最近文章 + Now 区） |
| `src/pages/about.astro` | 关于页（6 sections 玻璃卡） |
| `src/pages/404.astro` | 戏剧版 404（4 [Elysia] 4） |
| `src/pages/blog/[...page].astro` | 博客列表（分页 + sidebar） |
| `src/pages/blog/[...slug].astro` | 单篇文章 |
| `src/pages/categories/{index,[category]}.astro` | 分类总览 + 单分类 |
| `src/pages/tags/{index,[tag]}.astro` | 标签云 + 单标签 |
| `src/pages/friends.astro` | 友链 |
| `src/pages/search.astro` | 搜索 fallback 页（主入口已改 overlay） |
| `src/data/friends.json` | 友链数据 |
| `src/utils/reading-time.ts` | 中文友好的字数 + 阅读时长 |
| `src/content/blog/*.md` | 博文 |
| `src/assets/bg.jpg` | 全屏背景图（Vite 打包）|
| `src/assets/elysia.png` | favicon 源图 |
| `src/assets/blog/*.jpg` | 博文 hero 图（Astro Image 处理）|
| `scripts/gen-favicon.mjs` | 从 elysia.png 生成 4 个尺寸 favicon |
| `scripts/crop-hero.mjs` | 预裁竖版人像图为横版面孔居中 |
| `public/favicon-*.png` | 生成的 favicon 输出 |
| `.github/workflows/deploy.yml` | GitHub Actions 部署 |

## 常用命令

```powershell
npm run dev                          # 本地预览 http://localhost:4321/
npm run build                        # 生产构建到 dist/
node scripts/gen-favicon.mjs         # 重新生成 favicon
node scripts/crop-hero.mjs           # 预裁 hero 图（数组在脚本里改）
git push                             # 推送即触发部署
gh run list --workflow "Deploy to GitHub Pages" --limit 1   # 查最新部署状态
```

## 工作流约定

- 每次有 UI 改动 → 必须 `npm run build` 验证 → 再 commit + push
- 等 GitHub Actions 部署完成（~40s）再告知用户「已上线」
- 改动涉及视觉 → 提醒用户 **Ctrl+Shift+R** 强制刷新（默认刷新对图片/字体不奏效）
- 不要主动添加 emoji 到代码或文档；用户 UI 上要可爱有 emoji 是 OK 的
- 不要在 commit message 里加 `Co-Authored-By: Claude`，除非用户明确要

## 用户的 GitHub 信息

- 用户名：`WizardHeHeJun`（仓库名大小写敏感，URL 可大可小）
- 哔哩哔哩：https://space.bilibili.com/40752109
- X (Twitter)：https://x.com/wizardhehejun
- 这些链接已经写死在 Header.astro 和 Footer.astro 的 SVG `<a>` 里
