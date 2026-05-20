---
name: blog-post
description: 帮助在 Astro 6 + GitHub Pages 个人博客项目创建新博文。三种入口（CMS 浏览器 / CLI 菜单 / npm run new），引导填 frontmatter（5 类枚举分类 + 标签 + 置顶 + 草稿），按文章类型给结构模板，主动建议视觉元素（mermaid / 表格 / Shoka directives）和内容插入（行内图 / figure / link card / 引用块），辅助找 hero 图（用户已有图 / Safebooru 二选一），重要修改前提示 backup，最后跑 build + 提示 git push。使用场景：写一篇博文、写博客、新博文、记录一下、想发个 post、new post、create blog post。
---

# Blog Post Skill

帮助用户在博客（Astro 6 + GitHub Pages，玻璃风视觉设计）创建 / 编辑博文。

**启用条件**：本 skill 是 project-scoped（位于 `.claude/skills/`），Claude Code 在含本 skill 的项目目录内自动加载——无需额外校验。如果想做兜底自检，确认 cwd 或祖先目录含 `src/content.config.ts` + `src/content/blog/` 即可。

下文所有命令默认在**项目根目录**下执行（cwd = project root）。所有路径都用**相对路径**写，不写绝对路径（避免锁死到具体机器）。

**定位**：这是个**写博客**的 skill——管的是"怎么帮用户写好一篇博文"，不管"代码怎么写"。代码层面的约定独立维护，这里只关注博文工作流和博文功能。

---

## 贯穿性原则（任何步骤都适用）

### ⚠ 大改动前先 backup

要做以下任意一项时，**先**跑一次 backup（30 秒、不打扰）：

- 替换 hero 图（旧图覆盖、Astro Image 缓存重生）
- 大幅重写正文（>50% 内容变动）
- 改 schema 字段（category / tags / slug 重排）
- 跨多文件批量操作（如重命名 slug 牵涉 lqip.json）

操作：`npm run cli` → 「📦 备份」→ 选「📦 标准」。出问题用 `npm run cli` → 「📂 还原」回退。

### ⚠ CMS 路径的协作限制

走 CMS 浏览器编辑器（`npm run cms`）时，你**做不到**：

- 直接编辑浏览器里的 CodeMirror 内容
- 看到用户当前未保存的文字
- 替用户填表单字段

你**能做**：

- 输出 markdown 文本，让用户复制粘贴到 CodeMirror
- 用户 Ctrl+S 保存后 Read 磁盘上的 `.md` 文件查看状态
- 文件系统操作（如 Bash 复制图片到 `src/assets/blog/`）

这跟 TTY / Edit 路径下你能直接 Edit `.md` 文件的模式**完全不同**。

### ⚠ 分类兜底

5 个分类（项目分享 / 技术笔记 / 学习总结 / 生活随笔 / 碎碎念）是 schema 写死的枚举。如果用户主题**真的完全不在 5 类范围内**（比如「写一首诗」「卖二手物品」），归到 **「碎碎念」** 作为兜底——这一类最包容。

**不要 silently 选最近的**，先说一句：「这个跟现有 5 类都不太贴，归到碎碎念兜一下，OK 吗？」

---

## 工作流（5 步）

### Step 1: 选入口 + 理解主题 + 框架决策

四件事**一起问**，不要拆成多轮对话：

**(a) 入口偏好**（哪种工具流）：

| 入口 | 适合 | 命令 |
|------|------|------|
| **CMS 浏览器**（默认推荐） | 写长文 / 想要实时预览 + 表单填字段 | `npm run cms` → http://localhost:4322 |
| **CLI 菜单** | 终端流 + 顺便管备份 | `npm run cli` → 选「✍ 新建博文」|
| **直接 scaffold** | 字段都想清楚了 | `npm run new` |
| **直接 Edit** | 改已有博文 | Read/Edit `src/content/blog/<slug>.md` |

**(b) 主题 + 分类**：

- 标题、主题概述
- 分类（5 选 1）—— 模棱两可时优先问，实在不属于 → 「碎碎念」兜底（见上面贯穿性原则）

**(c) 视觉信号**：

- **是否置顶**（featured，默认否）—— 配合差异化视觉，适合教程类 / 重磅项目
- **是否先做草稿**（draft，默认否）—— 写到一半时勾上，正常 push 也不出现在线上列表
- **Hero 图来源**——**早问比晚问好**：「你已经有想用的图了吗？还是让我去 Safebooru 帮你搜？」把信号收集了，Step 4 才执行

完整 frontmatter 字段集 + 每个字段触发什么行为见 [references/blog-features.md](references/blog-features.md)。

边界场景见 [references/examples.md](references/examples.md)：用户没头绪 / 用户给了主题 / 改已有博文。

### Step 2: scaffold（按入口起手）

**不要手写 frontmatter**——schema enum 容易踩错。按 Step 1 (a) 选的入口执行：

- **CMS 路径**：用户在浏览器，**跳过本步**——左侧 form 直接填字段
- **CLI 菜单**：`npm run cli` → 选「✍ 新建博文」（内部委托给 `new-post.mjs`）
- **TTY 直接模式**：用户在终端 → `npm run new`，按 prompt 填
- **Piped 模式**（你在 Bash 工具里替用户走）：
  ```bash
  printf '<title>\n<slug>\n<cat-num>\n<tags-csv>\n<y/n>\n<desc>\n' | npm run new
  ```
  字段顺序：title / slug / category(1-5) / tags / featured / description。空回车 = 用默认 fallback。

边界场景见 [references/examples.md](references/examples.md)。

### Step 3: 协作起草 + 视觉 / 内容建议

**正文用户主导，你不替写**。三件事一起做：

**(a) 结构建议**——Read [references/article-templates.md](references/article-templates.md) 按分类挑结构模板。你只做：结构 / 节奏 / 语气 review / 错别字 / 病句修订。

**(b) 视觉建议**——Read [references/visual-elements.md](references/visual-elements.md) + [references/shoka-syntax.md](references/shoka-syntax.md)，按内容类型推荐：

- 「流程 / 决策 / 调用链」 → mermaid 图
- 「字段对比 / 配置矩阵」 → Markdown 表格
- 「故障排查 / Q&A / 题外话」 → `:::fold`
- 「不可逆操作 / 重大坑」 → `:::warning` / `:::danger`
- 「补充说明 / 操作贴士」 → `:::info` / `:::tip`

**(c) 内容插入**（图片 / 链接 / 引用）——Read [references/content-insertion.md](references/content-insertion.md)。涵盖：

- 行内图 vs Figure 块（独立段落 + alt 非空才 figure 化）
- 用户提供图片的放置规则（`src/assets/blog/<slug>-<n>.<ext>`）
- 链接两种形态（行内 `[text](url)` vs 独立段落裸 URL → Link Card OG 卡）
- 引用块（`> blockquote`，跟 `:::info` 的语义区分）

**CMS 路径特别注意**（见上面贯穿性原则）：你输出 markdown 文本片段，用户复制粘贴到 CodeMirror。文件系统操作（复制图片到 `src/assets/blog/`）可以直接做。

边界场景见 [references/examples.md](references/examples.md)：用户在 CMS 浏览器里 / 想插图 / 想加 OG 卡。

### Step 4: Hero 图（按 Step 1 收集的来源执行）

按 Step 1 (c) 收集到的 hero 图来源——Read [references/hero-image.md](references/hero-image.md)：

- **路径 A**（用户已有图）：拿到源 → 校验 → 放到 `src/assets/blog/<slug>.<ext>` → 必要时预裁
- **路径 B**（Safebooru 搜图）：API 检索 → Read 校验 → 下载到目标位置

共用规则（横版校验 / 拒绝清单 / 竖图预裁 / frontmatter 引用 / LQIP 自动化）都在同一文件 §C 节。

边界场景见 [references/examples.md](references/examples.md)：替换已有 hero 图（先 backup）。

### Step 5: 校验 + push + 收尾

**(a) 校验**：

```bash
npm run build  # prebuild 自动重生 lqip.json，不用手动跑 gen-lqip
```

**(b) Push**：

```bash
# 单图博文
git add src/content/blog/<slug>.md \
       src/assets/blog/<slug>.jpg \
       src/data/lqip.json
git commit -m "post: <文章标题>"
git push

# 带行内图时一起 add（<slug>-1.jpg / <slug>-2.png 等）
```

**(c) 观察部署**（可选但推荐）：

```bash
gh run list --workflow "Deploy to GitHub Pages" --limit 1  # 看一眼状态
# 或
gh run watch                                                # 实时盯进度
```

CI ~40-50s 完成。完成后刷一下博客主页 / 博文 URL 确认上线。

**(d) 草稿完成时收尾**（如果之前是 `draft: true` 现在要发布）：

1. 改 `draft: false`（或删掉那行）—— CMS form 复选框 / 手 Edit 都行
2. `npm run build` 再过一次
3. commit message 用 `post:` 前缀（替代之前可能用过的 `draft:` 前缀）
4. push

边界场景见 [references/examples.md](references/examples.md)：build 失败 / push 后 CI 红 / 改已有博文后的 commit 命名。

---

## 写作语气

**这是用户自己的个人博客，不是 AI 助手在写。** 助手只辅助、不替代。

正文语气特征（基于用户一贯的写法）：

- **直接、个人化、第一人称**——「我」为主
- **三类基调混合**：项目分享（务实带点小自夸）/ 技术笔记（踩坑+沉淀）/ 不想被时间冲走的碎碎念（私人化、随性）
- **可以轻快俏皮**，但**绝不套用任何 AI 助手的人格语气**（爱莉希雅 / 任何角色）——那是 chat 里的事，跟博文内容是两回事
- **不强行总结升华**——留余韵就好
- **第一段抓人**：具体场景 / 反常识结论 / 一个问句开局，不要软启动（"最近一直在想..."这种）
- **不假装严肃 / 不端着**

## 重要约束

1. **正文用户主导**——不替写完整正文，只辅助结构 / review / 修订
2. **`npm run build` 验证再 push**——不推未构建过的代码
3. **commit 不带 `Co-Authored-By: Claude`**（除非用户明说要）
4. **二次元图必须 Read 工具看图确认**——不要凭 tag 推断
5. **代码注释 / commit / PR title 用英文，正文 / UI / 解释用中文**
6. **博文文件用 `.md` 不要用 `.mdx`**——当前所有博文都是 .md；改用 .mdx 需要在 `astro.config.mjs` 的 mdx integration 里单独注册 remark 插件，容易漏

## 不该做的事

- ❌ 替用户写完整正文（剥夺创作）
- ❌ 强制按你的结构写（建议而非命令）
- ❌ 跳过 scaffold 自己手写 frontmatter
- ❌ push 前不跑 build
- ❌ 用 Safebooru 之外的找图站
- ❌ 没经 Read 工具看图直接拿 tag 推断的图
- ❌ commit 带 `Co-Authored-By: Claude`
- ❌ 强推一种入口——尊重用户选择（CMS / CLI / new / Edit 都行）
- ❌ 写博文时套 AI 助手的人格语气——那是对话语境
- ❌ silently 把不属于 5 类的主题归到最近分类（先问用户、最后兜底碎碎念）
- ❌ CMS 路径下直接 Edit 用户正在编辑的 `.md` 文件（会跟用户改动冲突）
- ❌ 把 hero 图当行内图重复用（frontmatter `heroImage` 已经渲染过一次）

## 示例对话

4 个典型场景 + 边界场景集见 [references/examples.md](references/examples.md)。
