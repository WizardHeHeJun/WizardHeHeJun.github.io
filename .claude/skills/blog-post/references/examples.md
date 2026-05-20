# 示例对话

4 个常见场景 + 边界场景集。**不是脚本**，是判断练习——让 LLM 在新对话里有"应该怎么走"的具体锚定。

## 示例 1：用户给了主题——默认走 CMS 路径

**用户**：「想写一篇博文，记录一下今天用 npm run new 这个 CLI 的体验」

**你的步骤**（对应 SKILL.md 工作流 Step 1-5）：

### Step 1: 四件事一起问

```
判断分类：技术笔记（关于工具的体验，不是炫耀项目本身）

问入口：
> 这篇我建议走 CMS（实时预览 + 表单填字段，对长文友好）。
> 或者你想用 CLI 菜单 / npm run new 直接 scaffold？

问视觉信号：
> 要置顶吗（教程类适合 featured）？
> 要不要先勾草稿，慢慢写？
> Hero 图你有想用的，还是让我去 Safebooru 帮你搜一张？
```

用户选「CMS + 不置顶 + 草稿先勾 + Safebooru 搜图」。

### Step 2: 启动 CMS

```powershell
# 先确保 cwd 在项目根目录
npm run cms
```

提示用户打开 http://localhost:4322，左侧 form 填 title / description / category=技术笔记 / tags=`cli, scaffold, astro` / 勾 ☑ draft。

### Step 3: 协作起草 + 视觉 + 内容建议

按 [article-templates.md](article-templates.md) 的「技术笔记」模板给大纲：

```
## 背景
- 之前手动建 .md：frontmatter 漏字段、pubDate 格式错、slug 重复
## 探索过程
- 评估过 pinyin-pro（300KB 拒绝）
- readline.question 在 Node 22 piped EOF hang（坑）
## 解决方案
- 自管理 stdin 行队列
- 明确 prompt slug（拒绝丑陋拼音）
## 沉淀
- 下次写带 CLI 的 Node 工具，避开 readline.question 直接用 stdin events
```

视觉建议（见 [visual-elements.md](visual-elements.md) + [shoka-syntax.md](shoka-syntax.md)）：

- 「探索过程」节适合 `:::fold[实现细节]` 收起来让主线干净
- 如果用户描述了 CLI 处理流程 → 建议 mermaid sequenceDiagram

**CMS 路径协作姿势**：你输出 markdown 文本，用户粘贴到 CodeMirror。不要直接 Edit 用户正在编辑的 `.md`。

### Step 4: Hero 图（用户选了 Safebooru）

按 [hero-image.md](hero-image.md) 路径 B：

- safebooru API 搜 `1girl+solo+upper_body+smile+computer+-from_behind+...排除`
- **Read 工具看候选图**确认露脸，不要直接信 tag
- 下载到 `src/assets/blog/<slug>.jpg`，竖图先用 `scripts/crop-hero.mjs` 预裁

### Step 5: 校验 + push + 收尾

完成时取消 draft → `npm run build` → commit + push：

```bash
git add src/content/blog/<slug>.md \
       src/assets/blog/<slug>.jpg \
       src/data/lqip.json
git commit -m "post: npm run new 用起来如何"
git push
gh run list --workflow "Deploy to GitHub Pages" --limit 1  # 看部署
```

### 替代路径：Piped scaffold

如果用户不在 TTY（如你在 Bash 工具里替走）：

```bash
printf 'npm run new 用起来如何\nnpm-run-new-review\n2\ncli,scaffold,astro\nn\n一次 30 分钟把博文创建摩擦清零的体验\n' | npm run new
```

## 示例 2：用户没头绪，不要急着 scaffold

**用户**：「想写点什么但不知道写啥」

**你**：**不调** `npm run new`，**不开** CMS，**不打开** CLI 菜单。先聊。问：

- 「最近做了什么 / 学了什么 / 烦什么 / 想感谢谁？」
- 「最近有没有想跟某个人分享但没机会说的事？」

让用户先发散，再判断分类 + 该走哪条入口。

**反模式**：直接给 5 个分类让用户选——用户没头绪选项越多越烦。
**反模式**：直接说「来，我帮你开 CMS」——入口是工具，没主题之前打开等于空跑。

## 示例 3：用户要置顶 + 自己有 hero 图

**用户**：「写一篇置顶的项目分享，做了个飞书文档监控工具。我电脑里有一张图，路径 `C:\Users\me\Pictures\anime\monitor.jpg`，用这张」

**你的步骤**：

### Step 1: 一次问完

- 分类：项目分享
- 入口：推荐 CMS（项目分享通常多个 callout + hero 图，预览效果好）
- featured: ✓（用户明说置顶）
- draft: 默认否
- Hero 来源：**用户已有图**（路径已经给了）

### Step 2: scaffold

用户在 CMS 里勾 ☑ featured，填字段。

### Step 3: 协作起草

按「项目分享」模板（见 [article-templates.md](article-templates.md)）。视觉建议（见 [visual-elements.md](visual-elements.md)）：

- 关键技术决策用 `:::tip`
- 踩过的坑用 `:::warning`
- 整体架构用 mermaid graph TD

如果博文里要再贴几张监控截图 → 见 [content-insertion.md](content-insertion.md)，命名 `<slug>-1.jpg` `<slug>-2.jpg`。

### Step 4: Hero 图（用户已有图，走路径 A）

按 [hero-image.md](hero-image.md) §A：

1. **Read 工具看一眼** 用户给的源路径（`C:\Users\me\Pictures\anime\monitor.jpg`）——确认能开 + 横版 + 露脸 + 无水印
2. 假设博文 slug 是 `feishu-doc-monitor-v2`，目标路径 `src/assets/blog/feishu-doc-monitor-v2.jpg`（相对项目根）
3. **复制**（cwd 在项目根目录）：
   ```powershell
   Copy-Item "C:\Users\me\Pictures\anime\monitor.jpg" "src/assets/blog/feishu-doc-monitor-v2.jpg"
   ```
   源路径按用户给的样子填，目标路径恒为相对的 `src/assets/blog/<slug>.<ext>`。
4. **再 Read 确认拷贝成功**
5. 如果是竖图 → 加进 `scripts/crop-hero.mjs` 跑一次
6. CMS form 的 heroImage 字段填 `../../assets/blog/feishu-doc-monitor-v2.jpg`

### Step 5: build + push

```bash
npm run build
git add src/content/blog/feishu-doc-monitor-v2.md \
       src/assets/blog/feishu-doc-monitor-v2.jpg \
       src/data/lqip.json
git commit -m "post: 飞书文档监控工具上线了"
git push
```

## 示例 4：用户想改一篇已发布的博文

**用户**：「之前那篇 building-this-blog 我想加一段，再补两张图」

**你的步骤**：

### Step 1: 不触发 scaffold（这是 edit）

- 入口：CMS 路径（左侧列表点该文章自动加载）或直接 Edit
- 分类 / featured / draft：保持原值，除非用户要改
- Hero：如果用户没要换图，跳过 Step 4
- 改动大不大？「加一段 + 补两张图」属于中等改动

### Step 2 跳过（不 scaffold）

### Step 3: 协作起草 + 视觉 / 内容建议

用户给两张图的源路径 → 你按 [content-insertion.md](content-insertion.md) 处理：

1. Read 工具看图
2. 复制到 `src/assets/blog/building-this-blog-1.jpg` 和 `building-this-blog-2.jpg`
3. 输出 markdown 引用片段给用户：
   ```markdown
   ![CMS 编辑器界面](../../assets/blog/building-this-blog-1.jpg)

   ![CLI 菜单截图](../../assets/blog/building-this-blog-2.jpg)
   ```
4. 用户在 CodeMirror 里把新段落 + 图引用粘贴到合适位置，Ctrl+S

**提示影响范围**：

- 改 `description` / `title` → 影响 OG meta / RSS
- 建议加 `updatedDate` → 博文页显示「最后更新于」
- 加新图 → `npm run build` 会自动重生 lqip.json

### Step 4-5: 跳 hero（不换）→ build + push

```bash
npm run build
git add src/content/blog/building-this-blog.md \
       src/assets/blog/building-this-blog-1.jpg \
       src/assets/blog/building-this-blog-2.jpg \
       src/data/lqip.json
git commit -m "update(building-this-blog): add CMS section + 2 screenshots"
git push
```

注意 commit 前缀用 `update:` 而不是 `post:`（区分新发布 vs 修订）。

---

## 边界场景集

### 场景：用户写到一半要停

主动跑 `npm run cms` form 里勾 ☑ draft（或在 frontmatter 加 `draft: true`）。可以正常 commit + push 到主干，线上不显示。

完成那天：取消 draft → `npm run build` → commit message 从 `draft:` 改成 `post:` → push。

（详细操作见 SKILL.md Step 5 的「草稿完成时收尾」节。）

### 场景：写正文时想插一张图

用户说「这里加一张监控架构图」，给了你本地路径 / URL / 截图。

按 [content-insertion.md](content-insertion.md) 流程：

1. Read 看一眼图
2. 复制到 `src/assets/blog/<slug>-<n>.<ext>`（用序号后缀避免跟 hero 撞）
3. 输出 markdown 给用户粘贴：
   ```markdown
   ![监控架构图](../../assets/blog/<slug>-1.jpg)
   ```
4. **独立段落** + **alt 非空** → 自动 figure 化 + 点击放大 lightbox

### 场景：用户想推荐一个外站资源

不要直接写「详见 https://...」放在段落里。用 Link Card：

```markdown
[正文]

https://github.com/withastro/astro

[继续正文]
```

中间裸 URL **单独一段** → 自动渲染成 OG 卡（标题 + 描述 + 缩略图）。

**前置**：跑 `npm run refresh-og` 抓 OG 数据，否则线上回退纯文本链接。

### 场景：替换或大改 hero 图

旧图会被覆盖，Astro Image 优化的 webp 也会全部重生。**先 backup**：

```bash
npm run cli  # → 📦 备份 → 🗜 完整（含 src/assets/blog/）
```

完整备份 ~13 MB，跑 ~3 秒。新图替换后 `npm run build` 验证再 push。

### 场景：用户已经在 CMS 浏览器里写，问你建议

你**不能**：spawn process 看浏览器 / 直接编辑 CodeMirror 内容 / 看用户当前未保存的文字。

你**能**：

- 文字建议结构 / 改写句子 / 推荐 directive
- 让用户复制段落给你看 → review 后回复修订建议
- Read 磁盘上的 `.md` 看保存状态（Ctrl+S 后才看得到）
- Bash 操作文件系统（如复制图片到 `src/assets/blog/`）
- 提示「记得 Ctrl+S」「完成时记得取消 draft」

### 场景：build 失败

- **schema 错误**：通常 `category` 不在 5 个枚举里，或 `pubDate` 格式不对（应该是 `'May 18 2026'` 无逗号）
- **markdown 错误**：看错误行号，常见是 `:::fold[标题]` 末尾少了 `:::`
- **缺 hero 图文件**：frontmatter 引用了 `heroImage` 但 `src/assets/blog/` 下没文件 → 注释回去或补图
- **YAML 解析错误**：标题里有英文单引号 → 用双引号或转义。CMS 路径下 form 会自动 escape，直接 Edit 容易踩

### 场景：完全不属于 5 类的主题

用户「我想写一首诗」「我要卖二手物品」之类。先问一句确认：

> 「这个跟现有 5 类（项目分享/技术笔记/学习总结/生活随笔/碎碎念）都不太贴。我归到『碎碎念』兜底，OK 吗？」

不要 silently 选最近的。**不要**主动建议「我们加个新分类吧」——schema 是写死的，加新分类是代码改动（不属于 blog-post skill 范畴）。

---

## 关键约束（用户多次明确）

- ❌ 不要替用户写完整正文
- ❌ commit message 不带 `Co-Authored-By: Claude`
- ❌ 不要用 Safebooru 之外的找图站
- ❌ 不要跳过 Read 工具看图直接信 tag
- ❌ 不要 push 没 build 过的代码
- ❌ 不要强推一种入口——用户偏好哪个就走哪个
- ❌ 写博文时套用 AI 助手的人格语气——博文是用户自己的个人写作，不是对话语境
- ❌ CMS 路径下直接 Edit 用户正在编辑的 `.md` 文件（会冲突）
- ❌ silently 把不属于 5 类的主题归到最近分类
- ✅ 正文用用户自己的语气：直接、个人化、第一人称为主，可以轻快俏皮但不要套人格
