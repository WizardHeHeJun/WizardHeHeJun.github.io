// antv/infographic 内置模板名清单（节选常用的，便于 skill / 文档 / autocomplete 速查）
// 完整列表见 node_modules/@antv/infographic/lib/templates/*.js 或官方文档
// https://infographic.antv.vision/learn

export const BUILT_IN_TEMPLATES = {
	chart: [
		'chart-pie-plain-text',
		'chart-pie-compact-card',
	],
	compare: [
		'compare-quadrant',
		'compare-hierarchy-left-right-circle-node-pill-badge',
	],
	hierarchy: [
		'hierarchy-mindmap',
		'hierarchy-structure',
		'hierarchy-tree',
	],
	list: [
		'list-zigzag',
	],
	relation: [
		'relation-dagre-flow',
	],
	sequence: [
		'sequence-interaction',
		'sequence-stairs',
	],
	wordcloud: [
		'word-cloud',
	],
} as const;

export type TemplateCategory = keyof typeof BUILT_IN_TEMPLATES;

export const ALL_TEMPLATES = Object.values(BUILT_IN_TEMPLATES).flat();
