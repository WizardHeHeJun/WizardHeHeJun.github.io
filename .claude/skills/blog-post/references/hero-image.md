# Hero 图：来源选择 + 放置 + 校验 + 预裁

每篇博文（特别是首篇 / 重要文章）建议配一张**横版人物露脸**的 hero 图，会用在博文页顶部（1020×510）、列表卡（320×200）、分类/标签页缩略（300×150）。

## Step 1: 选来源（先问用户）

| 来源 | 适合场景 | 关键操作 |
|------|----------|----------|
| **A. 用户已有图** | 自己画的 / 提前选好的 / 网上看到指定那张 / AI 生成 | 拿到路径/URL → 校验 → 放到正确位置 + 改对文件名 + 必要时预裁 → 更新 frontmatter |
| **B. Safebooru 搜图** | 没头绪、让助手帮挑 | API 搜 → Read 校验 → 下载到正确位置 + 更新 frontmatter |

**问法**：「这篇有特定的图想用吗？还是去 Safebooru 帮你搜一张？」

---

## 路径 A：用户已有图

### A.1 接收源（5 种可能形式）

| 用户给的形式 | 怎么处理 |
|------------|----------|
| 本地绝对路径 `C:\Users\xxx\Downloads\foo.jpg` | 直接读 |
| 本地相对路径 `..\some\path.jpg` | 解析成绝对路径再读 |
| URL `https://example.com/img.png` | curl 下载到目标位置 |
| 截图 / 剪贴板里的图 | 让用户先保存到本地、再给路径 |
| 模糊描述「就用我桌面那张」 | 让用户给精确路径，不要猜 |

### A.2 校验图片（**必做，每张都要 Read 看一眼**）

不要凭文件名或用户描述判断，必须 Read 实际看：

1. **能正常打开**——损坏的图 Read 会报错
2. **横版还是竖版**——width >= height 直接用；height > width 需要预裁（见 §C.2）
3. **人物露脸**——按 §C.1 的拒绝清单逐项检查
4. **文件大小合理**——超 3MB 提醒一下（影响 build 速度），超 8MB 强烈建议压缩或换图

### A.3 放到正确位置 + 改对名字

**目标路径固定**：`src/assets/blog/<slug>.<ext>`

- `<slug>` = 博文文件名去掉 `.md` 后缀（如 `foo-bar.md` → 图 `foo-bar.jpg`）
- `<ext>` = 保留源扩展名（`.jpg` / `.png` / `.webp` 都可，Astro Image 都吃）

**前提**：cwd 在项目根目录。所有路径都用相对路径写。

**PowerShell**：

```powershell
# 本地文件（用户给的源路径填到 $source）
Copy-Item "<用户给的源路径>" "src/assets/blog/<slug>.jpg"

# URL（curl）
curl -o "src/assets/blog/<slug>.jpg" "https://example.com/img.jpg"
```

**Bash**（Git Bash / WSL）：

```bash
cp "<用户给的源路径>" "src/assets/blog/<slug>.jpg"
# 或
curl -o "src/assets/blog/<slug>.jpg" "https://example.com/img.jpg"
```

**用户给的源路径**可能是任何形式（绝对路径如 `C:\Users\xxx\...`、相对路径、URL）——按 §A.1 接收，按原样填进 source 位置。**目标路径恒为相对的 `src/assets/blog/<slug>.<ext>`**。

**放置后再 Read 一次目标文件**，确认拷贝成功 + 内容正确。

### A.4 更新 frontmatter（见 §C.3）

---

## 路径 B：Safebooru 搜图

### B.1 站点选择

| 站点 | 状态 | 备注 |
|------|------|------|
| Safebooru ✓ | **首选** | JSON API 稳定、二次元覆盖广 |
| Unsplash | ❌ | 都是真实摄影，用户多次明说不喜欢 |
| Wallhaven | ❌ | WebFetch 被 403 |
| Pixabay | ❌ | WebFetch 被 403 |
| Pexels | ⚠ | 通但 anime 内容少 |

### B.2 API

```
https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=<tags>&json=1
```

返回 JSON 数组，每项有 `directory` + `image` 字段。完整图片 URL：
```
https://safebooru.org/images/{directory}/{image}
```

### B.3 黄金 Tags 组合

```
1girl + solo + upper_body + looking_at_viewer + smile + <topic_tag>
```

**必须排除**（防侧脸/背影/水印/多人/生贺图）：
```
-from_behind -from_side -1boy -character_name
-sample_watermark -comic -happy_birthday
```

URL 构造时空格用 `+`，`-` 表示排除。完整示例（找「电脑/编程」主题）：

```
https://safebooru.org/index.php?page=dapi&s=post&q=index&tags=1girl+solo+upper_body+looking_at_viewer+smile+computer+-from_behind+-from_side+-1boy+-character_name+-sample_watermark+-comic+-happy_birthday&json=1
```

### B.4 主题 tag 选词

| 博文主题 | safebooru tag 建议 |
|---------|-------------------|
| 编程/技术 | `computer` / `laptop` / `keyboard` |
| 阅读/学习 | `book` / `library` / `studying` |
| 旅行/生活 | `outdoors` / `sky` / `flower` |
| 工具/CLI | `computer` / `desk` |
| 数据/分析 | `chart` 不行（不存在）→ 退到 `computer` |
| 通用碎碎念 | 不加主题 tag，让结果更杂多 |

### B.5 下载到目标位置

直接下载到目标路径，避免一步无用的 move：

```bash
curl -o "src/assets/blog/<slug>.jpg" "https://safebooru.org/images/{directory}/{image}"
```

下载后用 Read 工具看图，按 §C.1 校验。

---

## §C 共用规则（两路径都走）

### §C.1 拒绝清单（Read 工具看图时的判断标准）

用户对 hero 图有明确偏好——必须**人物露脸**（多次因侧脸/背影/SAMPLE 水印被纠正过）。拒绝以下：

- 侧脸 / 背影（即使 tag 标了 `upper_body looking_at_viewer`，实际可能不是）
- SAMPLE 水印（部分 Safebooru 图带 SAMPLE 字样）
- 角色名水印（左下/右下英文角色名 watermark）
- 多人图（即使 tag 标了 `solo`，背景有路人）
- 生贺/happy birthday 类（蜡烛蛋糕画面）
- 严肃/战斗场景（用户偏好「休闲」）
- 露骨内容（用户的博客是公开的）

### §C.2 竖图必须预裁

竖版图（height > width）Astro Image 默认的 `attention` 算法会被高饱和装饰物（蝴蝶结 / 帽子 / 头饰）吸引，**切掉脸**。**必须预先用脚本裁成横版**。

流程：
1. 编辑 `scripts/crop-hero.mjs`，在 targets 数组加一条：
   ```js
   { file: 'src/assets/blog/<slug>.jpg', topRatio: 0.0, bottomRatio: 0.6 },
   ```
   - `topRatio` 是从顶部开始的裁剪起点（占原图高度比例）
   - `bottomRatio` 是裁剪终点
   - 一般 `0.0` 到 `0.6` 把头+上半身保留
2. 跑 `node scripts/crop-hero.mjs`
3. 重跑 `npm run build`（prebuild 会重生 lqip）

### §C.3 frontmatter 引用

```yaml
heroImage: '../../assets/blog/<slug>.jpg'
```

路径相对于 `src/layouts/BlogPost.astro`，**不是**博文 .md 自身。

- `npm run new` 生成的 frontmatter 里已有这一行（注释掉的 `# heroImage: ...`），加图后取消注释 + 改对扩展名
- CMS 路径：左侧 form 的 heroImage 字段填同样的路径，Ctrl+S 保存
- 手 Edit：直接改 frontmatter 那一行

### §C.4 LQIP 自动化

加 hero 图后**不用手动跑** `gen-lqip` —— prebuild 钩子会在 `npm run build` 前自动重生 `src/data/lqip.json`，把新图的 32px 缩略 + dominant color 加进去。

操作：
1. 把图放到 `src/assets/blog/<slug>.jpg`（路径 A 的复制 / 路径 B 的下载）
2. 取消 frontmatter heroImage 注释
3. `npm run build` —— prebuild 自动跑 gen-lqip

### §C.5 commit 三件套

放图 + 改 frontmatter + 跑 build 后，commit 时同时 add 三个文件：

```bash
git add src/content/blog/<slug>.md \
       src/assets/blog/<slug>.jpg \
       src/data/lqip.json
git commit -m "post: <文章标题>"
git push
```

`src/data/lqip.json` 必须跟图 + .md 一起 commit，否则线上 LQIP 占位会找不到新图的条目。
