// 模板聚合入口：built-in（antv 自带）+ 未来 custom（落在 src/designs/ 下的自定义 item/structure）
//
// 目前 my-blog 没有 custom 模板，所以 ALL = built-in。
// 当 .claude/skills/infographic-template-updater 注册新自定义模板时，
// 在 custom.ts 导出 CUSTOM_TEMPLATES 数组，然后在这里合并即可。

export { BUILT_IN_TEMPLATES, ALL_TEMPLATES, type TemplateCategory } from './built-in';
export { GLASS_PALETTE, GLASS_FONT, GLASS_THEME_CONFIG } from './glass-theme';
