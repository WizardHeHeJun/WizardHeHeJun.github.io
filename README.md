# WizardHeHeJun's Notes

个人博客源码——记录项目分享、技术笔记和碎碎念。

🌐 线上地址：[wizardhehejun.github.io](https://wizardhehejun.github.io/)

完整搭建过程见博文：[我用 Astro + GitHub Pages 搭了这个博客](https://wizardhehejun.github.io/blog/building-this-blog/)

---

## 技术栈

- **[Astro 6](https://astro.build/)** —— 静态站点生成器
- **GitHub Pages** —— 免费托管
- **GitHub Actions** —— 推送即自动部署
- **Markdown / MDX** —— 写作格式
- **[Pagefind](https://pagefind.app/)** —— 静态全文搜索
- **[APlayer](https://aplayer.js.org/) + [MetingJS](https://github.com/metowolf/MetingJS)** —— 音乐播放器
- **[LXGW WenKai Screen](https://github.com/lxgw/LxgwWenKai-Screen)** —— 手写感中文字体（jsDelivr CDN）

## 项目结构

```text
my-blog/
├── public/                          # 静态资源（直接拷到根路径）
│   ├── favicon-{16,32,192}.png      # 多尺寸浏览器图标
│   └── apple-touch-icon.png         # iOS 主屏图标
├── src/
│   ├── assets/                      # 项目源资源（Vite 打包，自动加 hash）
│   │   ├── elysia.png               # favicon 源图
│   │   ├── bg.jpg                   # 全屏背景图
│   │   ├── fonts/                   # 旧 Atkinson 字体（已弃用，未删）
│   │   ├── blog/                    # 博文 hero 图（按 slug 命名）
│   │   └── blog-placeholder-*.jpg   # 模板自带占位图
│   ├── components/                  # 可复用组件
│   │   ├── BaseHead.astro           # <head> 通用元数据 + LXGW 字体 CDN
│   │   ├── Header.astro             # 顶部导航（含「博客 ▾」hover dropdown + 🔍 搜索按钮）
│   │   ├── Footer.astro             # 全宽底部条 + 挂载所有全局组件
│   │   ├── HeaderLink.astro         # 导航链接组件
│   │   ├── FormattedDate.astro      # 中文日期格式化
│   │   ├── Sidebar.astro            # 博客列表的左侧栏（Profile/Stats/最近文章）
│   │   ├── Pagination.astro         # 分页器（数字 + 上下页）
│   │   ├── BgLayer.astro            # 独立背景层（绕开 backdrop-filter 冻结 bug）
│   │   ├── BgScrollSync.astro       # JS 把 scroll 进度同步到 --bg-y CSS 变量
│   │   ├── CursorTrail.astro        # 鼠标拖尾（节流 28fps，跳过触屏）
│   │   ├── SearchOverlay.astro      # 搜索浮窗（Pagefind JS API + 自定义 UI）
│   │   └── MusicPlayer.astro        # APlayer + MetingJS 右下角音乐播放器
│   ├── content/
│   │   └── blog/                    # ⭐ 写新文章的地方（.md / .mdx）
│   ├── content.config.ts            # 博文 collection schema（含 category / tags / featured）
│   ├── layouts/
│   │   └── BlogPost.astro           # 文章页布局（hero 图 + 玻璃 prose 卡）
│   ├── pages/                       # 路由页面
│   │   ├── index.astro              # 首页（hero 打字机 + 最近文章 + Now 区）
│   │   ├── about.astro              # 关于页（6 sections 玻璃卡）
│   │   ├── 404.astro                # 戏剧版 404（4 [Elysia] 4 + 浮动动画）
│   │   ├── friends.astro            # 友链页（数据来自 src/data/friends.json）
│   │   ├── search.astro             # 搜索页（fallback，主入口已改 overlay）
│   │   ├── rss.xml.js               # RSS 订阅
│   │   ├── blog/
│   │   │   ├── [...page].astro      # 博客列表（分页 + sidebar）
│   │   │   └── [...slug].astro      # 单篇文章动态路由
│   │   ├── categories/
│   │   │   ├── index.astro          # 分类总览
│   │   │   └── [category].astro     # 单分类下的文章列表
│   │   └── tags/
│   │       ├── index.astro          # 标签云
│   │       └── [tag].astro          # 单标签下的文章列表
│   ├── data/
│   │   └── friends.json             # 友链数据
│   ├── styles/
│   │   └── global.css               # 全局样式（玻璃变量 + 字体 + 渐变 fallback）
│   ├── utils/
│   │   └── reading-time.ts          # 中文友好的字数 + 阅读时长计算
│   └── consts.ts                    # 站点标题与描述
├── scripts/
│   ├── gen-favicon.mjs              # 从 src/assets/elysia.png 生成多尺寸 favicon
│   └── crop-hero.mjs                # 预裁竖图为脸居中横版（Astro <Image> 默认 center 裁剪友好）
├── .github/workflows/
│   └── deploy.yml                   # GitHub Actions 自动部署（Node 22）
├── CLAUDE.md                        # 项目惯例（供 AI 协作参考）
└── astro.config.mjs                 # Astro 配置（site URL + Pagefind integration）
```

## 主题特色

- 🌊 **毛玻璃风** —— 半透明白卡片 + `backdrop-filter: blur(18px) saturate(180%)`
- 🖼️ **滑块式视差背景** —— 独立 `bg-layer` div + JS 同步 scroll 进度，页头看图顶 / 页尾看图底
- 🔤 **霞鹜文楷** —— LXGW WenKai Screen via jsDelivr CDN，按字符 chunk 拆分
- 🇨🇳 **中文友好** —— `lang="zh-CN"`、中文日期、中文字数 + 阅读时长
- 🔍 **Pagefind 搜索** —— 静态全文索引，overlay popover 风格（按 `/` 全局打开）
- 🎵 **音乐播放器** —— APlayer + MetingJS，固定右下角，可换网易云任意歌单
- ✨ **鼠标拖尾** —— 三色斜方块短拖尾，自动跳过触屏 + 减少动画偏好
- 📌 **置顶机制** —— frontmatter `featured: true`，列表带徽章
- 🏷️ **分类 + 标签** —— 5 个枚举分类 + 自由标签，自动生成聚合页
- 🔗 **社交** —— GitHub / 哔哩哔哩 / X 一字排开

## 写新文章

```powershell
# 1. 在 src/content/blog/ 新建 .md 文件，最小 frontmatter：
---
title: '...'
description: '...'         # 30 字内，会进 meta description + 列表卡摘要
pubDate: 'May 14 2026'     # 英文日期格式
category: '项目分享'        # 5 选 1：项目分享 / 技术笔记 / 学习总结 / 生活随笔 / 碎碎念
tags: ['标签1', '标签2']    # 3-5 个
featured: true             # 可选，置顶
heroImage: '../../assets/blog/<slug>.jpg'  # 可选
updatedDate: 'May 14 2026' # 可选，更新过显示「最后更新于」
---

# 2. 本地预览
npm run dev      # http://localhost:4321/

# 3. 发布
git add .
git commit -m "post: 文章标题"
git push         # 推送后约 40-50 秒自动部署上线
```

## 常用命令

| 命令 | 作用 |
| :--- | :--- |
| `npm install` | 安装依赖（首次或换电脑后用） |
| `npm run dev` | 本地开发服务器 `localhost:4321` |
| `npm run build` | 构建生产版本到 `./dist/` |
| `npm run preview` | 本地预览构建产物 |
| `node scripts/gen-favicon.mjs` | 重新生成 favicon（换头像后用） |
| `node scripts/crop-hero.mjs` | 预裁竖版人像图为横版面孔居中 |

## 部署机制

推送到 `main` 分支后：

1. GitHub Actions 触发 `Deploy to GitHub Pages` workflow
2. Ubuntu runner 跑 `npm install` + `npm run build`（含 Pagefind 索引生成）
3. `dist/` 上传为 Pages artifact
4. 自动部署到 `wizardhehejun.github.io`

无需手动操作，`git push` 即发布。**约 40-50 秒**完成。

## 多设备协作

```powershell
# 新机器拉代码
git clone https://github.com/WizardHeHeJun/WizardHeHeJun.github.io.git
cd WizardHeHeJun.github.io
npm install

# 写之前先拉一下
git pull

# 写完推上去
git push
```

## 自定义提示

| 想改什么 | 改哪里 |
|---------|-------|
| 站点标题/描述 | `src/consts.ts` |
| 顶部导航/社交链接 | `src/components/Header.astro` + `src/components/Footer.astro` |
| 玻璃透明度/边框/阴影 | `src/styles/global.css` 的 `:root` 里 `--glass-*` 变量 |
| 全屏背景图 | 替换 `src/assets/bg.jpg` 即可 |
| favicon | 替换 `src/assets/elysia.png`，跑 `node scripts/gen-favicon.mjs` |
| 音乐歌单 | `src/components/MusicPlayer.astro` 第 4 行的 `playlistId`（网易云歌单 ID） |
| 友链 | `src/data/friends.json` |
| 首页 Now 区内容 | `src/pages/index.astro` 的 `.now-grid` 块 |
| 关于页技术栈/项目 | `src/pages/about.astro` 顶部的 `featured` 和 `stack` 数组 |
| 首页打字机短句 | `src/pages/index.astro` 的 `typeLines` 数组 |
| 鼠标拖尾颜色/速度 | `src/components/CursorTrail.astro` |

## 项目惯例（重要！别再踩这些坑）

详见 [CLAUDE.md](./CLAUDE.md) 和[博文中的「项目工作规范」一节](https://wizardhehejun.github.io/blog/building-this-blog/)。摘几条：

1. **背景图必须用独立 `BgLayer` 组件**——别直接挂 body，否则 `backdrop-filter` 会冻结
2. **二次元图必须先 `Read` 工具验证**——LLM 基于 tag 推断常常出错
3. **竖版人像图必须用 `crop-hero.mjs` 预裁**——Astro `<Image>` 的 attention 算法对二次元不准
4. **Pagefind 动态 import 必须用 `<script is:inline>`**——否则 Vite 在构建时报错
5. **改完必须 `npm run build` 验证再 push**——别提交未构建过的代码

## License

代码 MIT。文章内容请勿转载。
