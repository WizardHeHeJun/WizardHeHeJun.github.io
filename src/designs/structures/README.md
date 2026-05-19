# src/designs/structures

antv infographic 自定义 **Structure** 组件落点。

## 现状

目录为空——my-blog 当前只用 antv 包内置的 Structure 组件。本目录是骨架，等需要时再填。

## 怎么往这里加东西

调用 `.claude/skills/infographic-structure-creator` skill：

> "用 infographic-structure-creator 写一个 [描述] 的 structure，分类 list / 横向布局 / 支持 add+remove 按钮"

skill 会读 `references/structure-prompt.md` 的 antv 规范，输出一个 TSX 文件落到这里。

## 命名约定

- 文件名：`CamelCase.tsx`（如 `ListRow.tsx`、`CompareLeftRight.tsx`）
- 组件名：和文件名一致
- 注册名（`registerStructure('xxx', ...)` 第一参）：小写连字符 + 分类前缀（如 `list-row`、`compare-left-right`）
- 分类前缀：`list-` / `compare-` / `sequence-` / `hierarchy-` / `relation-` / `geo-` / `chart-`
- Props 接口：`[ComponentName]Props extends BaseStructureProps`

## 注册触发

写完 TSX 后，需要在某处 import 一次以触发 `registerStructure` 副作用。建议建一个 `src/designs/structures/index.ts` 做 barrel：

```ts
import './ListRow';
import './CompareLeftRight';
// ...
```

然后在 antv ssr 调用前（如 `plugins/remark-infographic.mjs` 或它的依赖里）引入 `src/designs/structures/index.ts`。

## 同步到 built-in.ts

新增 structure 注册后，记得同步加进 `src/templates/built-in.ts` 的 `BUILT_IN_TEMPLATES`——用 `infographic-template-updater` skill 一次性完成。

## 参考

- antv 框架规范见 `.claude/skills/infographic-structure-creator/references/structure-prompt.md`
- 现有自定义模板枚举见 `src/templates/built-in.ts`
