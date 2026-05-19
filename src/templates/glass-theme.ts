// 玻璃风 antv/infographic theme 配置
// 由 plugins/remark-infographic.mjs 在用户未显式指定 themeConfig 时自动注入
//
// 设计取色逻辑：
//   - 主色：var(--accent) #2337ff（导航/链接）
//   - 强调：#ff5d8f（nav 粉胶囊 / 拖尾色）
//   - 辅蓝：#66ccff（滚动条 / 副标题）
//   - 浅粉：#ffd1e4（friend 卡渐变低饱和段）
//   - 暖橙：#b8860b（置顶徽章 / cat 标签）
// 这 5 色循环用作 chart palette；text/title/desc 使用 colorPrimary 与 LXGW 字体

export const GLASS_PALETTE = [
	'#2337ff', // accent
	'#ff5d8f', // pink hot
	'#66ccff', // sky blue
	'#ffd1e4', // pink soft
	'#b8860b', // amber
];

export const GLASS_FONT = "'LXGW WenKai Screen', 'PingFang SC', 'Microsoft YaHei', sans-serif";

export const GLASS_THEME_CONFIG = {
	colorPrimary: GLASS_PALETTE[0],
	palette: GLASS_PALETTE,
	base: {
		text: {
			fontFamily: GLASS_FONT,
		},
	},
	title: {
		fontFamily: GLASS_FONT,
		fill: '#222939',
	},
	desc: {
		fontFamily: GLASS_FONT,
		fill: 'rgb(96, 115, 159)', // --gray
	},
};
