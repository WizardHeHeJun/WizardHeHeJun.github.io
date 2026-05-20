# 文章内容插入：图片 / 链接 / 引用块

正文里插入图片、外链、引用时各种用法的速查 + 用户提供资源时的处理流程。

## 一张速查表

| 你想要的视觉 | 怎么写 |
|------------|--------|
| 段落中间的小图（行内） | `![alt](src)` 跟文字混排 |
| 带图注的大图（自动 lightbox） | **单独一段**只有 `![alt](src)` 且 alt 非空 |
| 段落中的链接 | `[text](url)` |
| 推荐外站的 OG 卡 | **单独一段**只写裸 URL（无文字） |
| 引用别人的话 | `> blockquote` |

## 行内图片 vs Figure 块

**触发 Figure** 的精确条件（remark-figure 插件）：

- 段落里**只有一个** `![alt](src)`
- **alt 必须非空**

满足 → 自动包成 `<figure>` + `<figcaption>`（用 alt 文本作图注）+ 点击放大 lightbox

例：

```markdown
这段文字里夹一个小图 ![small](icon.png)，跟字混排。

下一段开始：

![用户登录后的页面截图](../../assets/blog/foo-bar-1.jpg)
```

第二段会自动 figure 化。**反 figure 化**：要么把图跟其他文字混排（不独立成段），要么 alt 留空。

## 用户提供图片的放置流程

跟 hero 图同套规则（见 [hero-image.md](hero-image.md) §C），但**位置和命名不一样**：

| 类型 | 目标路径 | 命名 |
|------|---------|------|
| Hero 图（封面） | `src/assets/blog/<slug>.<ext>` | 跟博文 slug 同名 |
| 行内 / figure 图 | `src/assets/blog/<slug>-<n>.<ext>` | 加序号后缀 |

例：博文 `feishu-doc-monitor.md` 里要插 3 张图，分别放：
- `src/assets/blog/feishu-doc-monitor-1.jpg`
- `src/assets/blog/feishu-doc-monitor-2.png`
- `src/assets/blog/feishu-doc-monitor-3.webp`

markdown 里引用：

```markdown
![架构图](../../assets/blog/feishu-doc-monitor-1.jpg)
```

路径相对于 `src/layouts/BlogPost.astro`，跟 hero 图一致。

### 用户给的源形式（5 种可能）

跟 hero 图同套（见 hero-image.md §A.1）：本地绝对路径 / 相对路径 / URL / 截图 / 模糊描述。处理步骤：

1. **Read 工具看一眼图**——确认能开、内容对得上、不是糊掉的占位
2. **复制 / 下载到目标路径**（cwd 必须在项目根目录；目标用相对路径）：
   ```powershell
   # PowerShell（用户给的源路径按原样填）
   Copy-Item "<用户给的源路径>" "src/assets/blog/<slug>-<n>.jpg"

   # 或用 curl 拉 URL
   curl -o "src/assets/blog/<slug>-<n>.jpg" "https://example.com/img.jpg"
   ```
3. **再 Read 一次目标文件**确认拷贝成功
4. **markdown 里写引用**：`![alt](../../assets/blog/<slug>-<n>.jpg)`

### 文件大小提醒

- 行内 / figure 图建议 **< 1MB**（图越多博文加载越慢）
- 超 2MB → 提醒用户压缩（推荐 [tinypng.com](https://tinypng.com) / Squoosh）
- **LQIP 系统只覆盖 hero 图**，不覆盖行内图——所以行内图加载体验更依赖原图大小

### 不要走 public/

能用但**会失去 Astro Image 优化**（webp 转换 / hash + cache busting / 响应式 sizes）。统一放 `src/assets/blog/`。

## 链接

### 行内链接（最常见）

```markdown
看 [Astro 官网](https://astro.build) 了解更多
```

渲染：粉色 accent 颜色 + 下划线 hover 效果。

### Link Card（独立段落裸 URL → OG 卡）

**触发**：段落里**只有一个**裸 URL，**不带其他文字**。

```markdown
[文章正文]

https://github.com/withastro/astro

[继续正文]
```

中间那行会自动渲染成 OG 预览卡：标题 + 描述 + 缩略图 + favicon + host。

**前置依赖**：要让 OG 卡有数据，先把 URL 加进缓存：

```bash
npm run refresh-og              # 增量抓未缓存的 URL
npm run refresh-og -- --force   # 全量重抓
```

或编辑 `src/data/og-cache.json` 手填条目。

**抓不到时**：Link Card 降级为纯文本链接，**不会断图**。

**反模式**：不要给**自己博客**的 URL 包 Link Card（站内已有更顺的链接形态）——用 `[文章名](/blog/<slug>/)` 行内相对链接，路径短、不依赖 OG 抓取、永远不会断。

## 引用块（blockquote）

```markdown
> 这是别人说过的话或重要语录
```

渲染：左侧粉色色条 + 玻璃风背景。**适合**：

- 引用书原句（学习总结类博文用）
- 引用别人的话或推文
- 强调一段重要的话

**不适合**：跟 `:::info` 混用。语义重复——blockquote 表「引用」，`:::info` 表「补充信息」。具体选择：

| 你的内容是 | 用哪个 |
|----------|--------|
| 别人说的话（书、人、推文） | `> blockquote` |
| 你自己写的补充说明 | `:::info` |
| 操作贴士 / 加速技巧 | `:::tip` |

## 反模式（避免踩坑）

- ❌ **alt 写成 "image" / "图片" 这种废话**——figcaption 会显示这些，难看；要么写有信息量的 alt（"用户登录后的页面截图"），要么留空走行内不 figure 化
- ❌ **把 hero 图当行内图用**——hero 图是 frontmatter `heroImage` 字段，不要在正文里再 `![](../../assets/blog/<slug>.jpg)` 一次（重复显示）
- ❌ **用 `<img>` HTML 标签**——markdown `![](src)` 才能走 Astro Image 优化
- ❌ **行内图放 public/**——失去 Astro Image 优化
- ❌ **Link Card 包裹自己博客的 URL**——用行内链接
- ❌ **`> blockquote` 嵌套 `:::info`**——视觉冗余 + 语义混淆
- ❌ **一篇博文 10+ 张图**——加载慢；考虑只留核心几张，其他用 `:::fold[更多截图]` 收起来

## 与 CMS 的协作（特别注意）

CMS 浏览器路径下，用户在 CodeMirror 里写正文。你**不能直接** Edit 文件（会跟用户编辑冲突）。处理用户提供图片时的姿势：

1. 接收用户的图片源（路径/URL/截图）
2. 你用 Bash 复制到 `src/assets/blog/<slug>-<n>.<ext>`（这步可以直接做，因为是文件操作不是编辑）
3. 输出 markdown 引用片段给用户：「插入这段到合适位置：`![描述](../../assets/blog/<slug>-1.jpg)`」
4. 用户在 CodeMirror 里粘贴 + Ctrl+S 保存

不要在用户编辑时直接改 .md 文件——会触发 CMS 的 conflict 或丢失用户当前未保存的修改。
