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
| `src/components/Header.astro` | 顶部导航、社交链接（GitHub / 哔哩哔哩 / X）|
| `src/components/Footer.astro` | 页脚、社交链接 |
| `src/layouts/BlogPost.astro` | 文章布局、glass `.prose` 卡片 |
| `src/pages/index.astro` | 首页 |
| `src/pages/about.astro` | 关于页 |
| `src/pages/blog/index.astro` | 博客列表（含置顶排序、徽章 CSS）|
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
