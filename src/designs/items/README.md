# src/designs/items

antv infographic 自定义 **Item** 组件落点。

## 现状

目录为空——my-blog 当前只用 antv 包内置的 Item 组件。本目录是骨架，等需要时再填。

## 怎么往这里加东西

调用 `.claude/skills/infographic-item-creator` skill：

> "用 infographic-item-creator 写一个 [描述] 的 item，要支持 icon + label + value"

skill 会读 `references/item-prompt.md` 的 antv 规范，输出一个 TSX 文件落到这里。

## 命名约定

- 文件名：`CamelCase.tsx`（如 `DoneList.tsx`、`ChartColumn.tsx`）
- 组件名：和文件名一致
- 注册名（`registerItem('xxx', ...)` 第一参）：小写连字符（如 `done-list`、`chart-column`）
- Props 接口：`[ComponentName]Props extends BaseItemProps`

## 注册触发

写完 TSX 后，需要在某处 import 一次以触发 `registerItem` 副作用。建议建一个 `src/designs/items/index.ts` 做 barrel：

```ts
import './DoneList';
import './ChartColumn';
// ...
```

然后在 antv ssr 调用前（如 `plugins/remark-infographic.mjs` 或它的依赖里）引入 `src/designs/items/index.ts`。

## 参考

- antv 框架规范见 `.claude/skills/infographic-item-creator/references/item-prompt.md`
- 现有自定义模板枚举见 `src/templates/built-in.ts`
