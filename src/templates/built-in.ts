// antv/infographic 内置模板速查
//
// antv 实际注册了 276 个模板（@antv/infographic 0.3.19）——
// 完整列表通过 runtime API 获取：
//   import { getTemplates } from '@antv/infographic';
//   getTemplates();  // string[] of all 276 template keys
//
// 这里挑选「最常用 / 最具代表性」的子集，给 .claude/skills/infographic-* 自动补全用。
// 命名规则：`<category>-<structure>-<item-style>`（部分模板省略 item-style）

export const BUILT_IN_TEMPLATES = {
	// 图表类（chart-* / chart-wordcloud-*）
	chart: [
		'chart-pie-plain-text',
		'chart-pie-compact-card',
		'chart-pie-donut-plain-text',
		'chart-bar-plain-text',
		'chart-column-simple',
		'chart-line-plain-text',
		'chart-wordcloud',
		'chart-wordcloud-rotate',
	],

	// 对比类（compare-*）
	compare: [
		'compare-binary-horizontal-simple-vs',
		'compare-binary-horizontal-badge-card-arrow',
		'compare-binary-horizontal-compact-card-vs',
		'compare-quadrant-quarter-simple-card',
		'compare-quadrant-quarter-circular',
		'compare-hierarchy-left-right-circle-node-pill-badge',
		'compare-hierarchy-row-letter-card-compact-card',
		'compare-swot',
	],

	// 层级类（hierarchy-*）
	hierarchy: [
		'hierarchy-mindmap-branch-gradient-capsule-item',
		'hierarchy-mindmap-level-gradient-compact-card',
		'hierarchy-structure',
		'hierarchy-structure-mirror',
		'hierarchy-tree-tech-style-compact-card',
		'hierarchy-tree-curved-line-rounded-rect-node',
		'hierarchy-tree-dashed-line-badge-card',
	],

	// 列表类（list-*）
	list: [
		'list-grid-badge-card',
		'list-grid-compact-card',
		'list-grid-circular-progress',
		'list-column-vertical-icon-arrow',
		'list-row-horizontal-icon-arrow',
		'list-row-simple-horizontal-arrow',
		'list-pyramid-badge-card',
		'list-sector-plain-text',
		'list-waterfall-badge-card',
		'list-zigzag-up-compact-card',
	],

	// 关系类（relation-*）
	relation: [
		'relation-circle-circular-progress',
		'relation-circle-icon-badge',
		'relation-dagre-flow-lr-badge-card',
		'relation-dagre-flow-tb-compact-card',
		'relation-network-icon-badge',
	],

	// 序列类（sequence-*）
	sequence: [
		'sequence-ascending-steps',
		'sequence-circular-simple',
		'sequence-pyramid-simple',
		'sequence-timeline-plain-text',
		'sequence-timeline-rounded-rect-node',
		'sequence-roadmap-vertical-badge-card',
		'sequence-snake-steps-pill-badge',
		'sequence-stairs-front-pill-badge',
		'sequence-funnel-simple',
		'sequence-mountain-underline-text',
	],

	// 象限（quadrant-*）
	quadrant: [
		'quadrant-quarter-simple-card',
		'quadrant-quarter-circular',
		'quadrant-simple-illus',
	],
} as const;

export type TemplateCategory = keyof typeof BUILT_IN_TEMPLATES;

/**
 * 速查列表（约 50 个），按类分组。
 * 想要完整 276 个，调用 `getAllTemplates()` 拿 antv runtime 注册表。
 */
export const ALL_TEMPLATES = Object.values(BUILT_IN_TEMPLATES).flat();

/**
 * 通过 antv runtime API 获取**全部 276 个**注册模板（含 my-blog 未列入速查的细分变体）。
 * 用于 infographic-syntax-creator skill 在用户问「有没有 X 类型」时穷举校验。
 */
export async function getAllTemplates(): Promise<string[]> {
	const { getTemplates } = await import('@antv/infographic');
	return getTemplates();
}
