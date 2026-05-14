---
title: '我用 Astro + GitHub Pages 搭了这个博客'
description: '记录这个博客是怎么从零搭起来的——技术选型、踩过的坑、毛玻璃主题的实现。'
pubDate: 'May 14 2026'
featured: true
heroImage: '../../assets/blog/building-this-blog.png'
---

## 为什么要搭博客

很多想法、踩过的坑、灵光乍现的瞬间，如果不写下来就会被时间冲走。比起依赖记忆力对抗遗忘，把它们交给文字更靠谱——这就是有了这个小角落的初衷。

## 选型

短暂调研后定了 **Astro + GitHub Pages + GitHub Actions** 三件套：

- **Astro**：静态站点生成器，主打"少 JS、快加载"。适合内容型站点
- **GitHub Pages**：免费托管，对 `<用户名>.github.io` 仓库还有特殊待遇——直接挂在主域名下，无子路径
- **GitHub Actions**：推到 `main` 分支即自动构建部署，全程零运维

对比过 Hugo、WordPress、Hexo——Astro 胜在 Markdown 写作 + 现代主题生态 + 未来想加 React/Vue 组件也无缝。

## 关键步骤

```
npx create-astro@latest my-blog --template blog --install --git
```

生成项目骨架后做了这些事：

1. **本地化**：把 `<html lang>`、日期格式、导航文案都换成中文
2. **写 GitHub Actions workflow**：official 版本踩了一个坑——Astro 6 要求 Node 22+，但 `withastro/action@v3` 默认用 Node 20，所以要显式 `node-version: 22`
3. **三个社交图标**：GitHub、哔哩哔哩、X 的 SVG path 直接嵌在 Header 和 Footer 里
4. **自定义 favicon**：从一张头像生成 16/32/192 + apple-touch 四个尺寸（用 sharp，Astro 自带依赖）
5. **毛玻璃主题**：全屏背景图 + `backdrop-filter: blur(18px) saturate(180%)`，让所有内容卡片透出底层背景

## 一些可能有用的细节

- **Windows 第一坑**：PowerShell 默认禁脚本，`npm` 跑不了。`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` 解决
- **`gh repo create --public --source=. --push`**：建仓库 + 推代码一条搞定，无需手动操作 GitHub 网页
- **背景图引用方式**：放在 `src/assets/` 下，CSS 用 `url('../assets/bg.jpg')`，Vite 会自动打包成带哈希的文件名（缓存破坏免费送）

## 未来想加的

- Giscus 评论（基于 GitHub Issues，零维护）
- 标签 / 分类
- 暗色模式

代码全部开源：[github.com/WizardHeHeJun/WizardHeHeJun.github.io](https://github.com/WizardHeHeJun/WizardHeHeJun.github.io)

如果你也想搭一个类似的博客，README 里有完整的项目结构和自定义指南。
