// 一次性 probe：验证 @antv/infographic SSR 渲染 + theme 注入是否真能工作
// 用法：node scripts/probe-infographic.mjs，看 tmp/probe-*.svg
import { renderToString } from '@antv/infographic/ssr';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

if (!existsSync('tmp')) mkdirSync('tmp');

const cases = [
	{
		name: 'pie-default',
		options: {
			template: 'chart-pie-plain-text',
			width: 600,
			height: 400,
			data: {
				items: [
					{ value: 30, label: 'Astro' },
					{ value: 25, label: 'Vue' },
					{ value: 20, label: 'React' },
					{ value: 15, label: 'Svelte' },
					{ value: 10, label: 'Solid' },
				],
			},
		},
	},
	{
		name: 'pie-with-glass-theme',
		options: {
			template: 'chart-pie-plain-text',
			width: 600,
			height: 400,
			data: {
				items: [
					{ value: 30, label: 'Astro' },
					{ value: 25, label: 'Vue' },
					{ value: 20, label: 'React' },
					{ value: 15, label: 'Svelte' },
					{ value: 10, label: 'Solid' },
				],
			},
			themeConfig: {
				palette: ['#2337ff', '#ff5d8f', '#66ccff', '#ffd1e4', '#b8860b'],
			},
		},
	},
	{
		name: 'json-string-mode',
		options: JSON.stringify({
			template: 'chart-pie-plain-text',
			width: 600,
			height: 400,
			data: {
				items: [
					{ value: 50, label: 'JSON string mode' },
					{ value: 50, label: 'works' },
				],
			},
		}),
	},
];

for (const { name, options } of cases) {
	try {
		console.log(`\n[${name}] rendering...`);
		const start = Date.now();
		const svg = await renderToString(options);
		const dur = Date.now() - start;
		const outPath = `tmp/probe-${name}.svg`;
		writeFileSync(outPath, svg, 'utf8');
		// 检查 svg 是否真的有内容
		const hasSvg = svg.startsWith('<svg');
		const len = svg.length;
		const colorHits = (svg.match(/#[0-9a-fA-F]{6}/g) || []).slice(0, 5);
		console.log(`  ✓ ${dur}ms  ${len} bytes  starts=${hasSvg ? 'svg' : svg.slice(0, 30)}`);
		console.log(`    color samples: ${colorHits.join(', ')}`);
		console.log(`    → ${outPath}`);
	} catch (e) {
		console.error(`  ✗ ${name} failed:`, e.message || e);
	}
}
