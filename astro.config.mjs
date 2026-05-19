// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import remarkDirective from 'remark-directive';
import remarkInfographic from './plugins/remark-infographic.mjs';
import remarkShokaDirectives from './plugins/remark-shoka-directives.mjs';

// 共享给 .md（markdown）和 .mdx（mdx integration）—— CLAUDE.md §39：
// astro 顶层 markdown.remarkPlugins 不会被 mdx() 继承，必须两处都注册
const remarkPlugins = [remarkDirective, remarkShokaDirectives, remarkInfographic];

// https://astro.build/config
export default defineConfig({
	site: 'https://wizardhehejun.github.io',
	integrations: [mdx({ remarkPlugins }), sitemap(), pagefind()],
	markdown: {
		remarkPlugins,
	},
});
