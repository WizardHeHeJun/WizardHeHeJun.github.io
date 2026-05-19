// 把 markdown 里的 ```infographic 代码块转成 inline SVG（编译期静态化）
//
// 语法：
//   ```infographic [template-name]
//   <YAML body>
//   ```
//
//   - template-name 可选，作为 lang 的第二个 token；优先级低于 YAML 内 template 字段
//   - YAML body 解析为 antv InfographicOptions 对象
//   - 若 themeConfig 未指定，自动注入 GLASS_THEME_CONFIG（玻璃风）
//   - 错误时输出 .infographic-error figure + 原 DSL + 错误信息，build 不挂
//
// 实现要点（async in remark）：
//   visit() 同步遍历收集所有 infographic 节点；await Promise.all 跑 renderToString；
//   再同步把每个原节点替换为 html 节点（mdast type='html'，含裸 HTML 字符串）
import { renderToString } from '@antv/infographic/ssr';
import { visit } from 'unist-util-visit';
import { load as yamlLoad } from 'js-yaml';

// 玻璃风默认 theme —— source of truth 在 src/templates/glass-theme.ts
// 此处保持副本同步以避免 .mjs plugin import .ts 的麻烦
const GLASS_THEME_CONFIG = {
	colorPrimary: '#2337ff',
	palette: ['#2337ff', '#ff5d8f', '#66ccff', '#ffd1e4', '#b8860b'],
	base: {
		text: {
			fontFamily: "'LXGW WenKai Screen', 'PingFang SC', 'Microsoft YaHei', sans-serif",
		},
	},
	title: {
		fontFamily: "'LXGW WenKai Screen', 'PingFang SC', 'Microsoft YaHei', sans-serif",
		fill: '#222939',
	},
	desc: {
		fontFamily: "'LXGW WenKai Screen', 'PingFang SC', 'Microsoft YaHei', sans-serif",
		fill: 'rgb(96, 115, 159)',
	},
};

const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 480;

export default function remarkInfographic() {
	return async (tree) => {
		const tasks = []; // { node, parent, options?, error? }

		// 第一遍：收集所有 ```infographic code block
		visit(tree, 'code', (node, _index, parent) => {
			if (!node.lang) return;
			const [lang, templateOverride] = node.lang.split(/\s+/);
			if (lang !== 'infographic') return;
			if (!parent) return;

			let options;
			try {
				const parsed = yamlLoad(node.value);
				if (parsed == null) {
					options = {};
				} else if (typeof parsed !== 'object' || Array.isArray(parsed)) {
					throw new Error('infographic body must be a YAML mapping');
				} else {
					options = parsed;
				}
				if (templateOverride && !options.template) {
					options.template = templateOverride;
				}
				if (!options.themeConfig) {
					options.themeConfig = GLASS_THEME_CONFIG;
				}
				if (options.width == null) options.width = DEFAULT_WIDTH;
				if (options.height == null) options.height = DEFAULT_HEIGHT;
				tasks.push({ node, parent, options });
			} catch (e) {
				tasks.push({ node, parent, error: e });
			}
		});

		if (tasks.length === 0) return;

		// 第二遍：并行 renderToString，错误时降级
		const results = await Promise.all(
			tasks.map(async (t) => {
				if (t.error) {
					return { ...t, html: makeErrorFigure(t.node.value, t.error.message) };
				}
				try {
					const svg = await renderToString(t.options);
					return {
						...t,
						html: `<figure class="infographic">${stripXmlDecl(svg)}</figure>`,
					};
				} catch (e) {
					return {
						...t,
						html: makeErrorFigure(t.node.value, e.message || String(e)),
					};
				}
			}),
		);

		// 同步回填：mdast html 节点替换原 code 节点
		for (const r of results) {
			const idx = r.parent.children.indexOf(r.node);
			if (idx === -1) continue;
			r.parent.children[idx] = {
				type: 'html',
				value: r.html,
			};
		}
	};
}

function stripXmlDecl(svg) {
	return svg.replace(/<\?xml[^?]*\?>/g, '').trim();
}

function escapeHtml(s) {
	return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function makeErrorFigure(dsl, msg) {
	return (
		`<figure class="infographic infographic-error">` +
		`<pre><code>${escapeHtml(dsl)}</code></pre>` +
		`<small>infographic 渲染失败：${escapeHtml(msg)}</small>` +
		`</figure>`
	);
}
