// 把独占一段的裸 URL 转成 OG 链接卡（左：标题+描述+favicon+host / 右：缩略图）
//
// 触发条件：paragraph 只有 1 个 link 节点，且 link.children 为空或为 text(value === link.url)
// 这覆盖：
//   1. 一行只有 https://example.com（GFM autolink-literal 转 link 节点）
//   2. 一行只有 <https://example.com>（显式 autolink）
//
// 数据源：src/data/og-cache.json（由 scripts/refresh-og.mjs 离线抓取并 commit）
// 没缓存或 status=failed 时降级为 fallback 文本卡，不会断渲染
import { existsSync, readFileSync } from 'node:fs';
import { visit } from 'unist-util-visit';

const CACHE_PATH = 'src/data/og-cache.json';

function loadCache() {
	if (!existsSync(CACHE_PATH)) return {};
	try {
		return JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
	} catch {
		return {};
	}
}

function escapeHtml(s) {
	return String(s)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function getHost(url) {
	try {
		return new URL(url).hostname.replace(/^www\./, '');
	} catch {
		return url;
	}
}

function extractBareLinkUrl(node) {
	if (node.type !== 'paragraph' || !node.children || node.children.length !== 1) return null;
	const link = node.children[0];
	if (link.type !== 'link') return null;
	// children: 空 / 单 text 且 value === url
	if (link.children.length === 0) return link.url;
	if (
		link.children.length === 1 &&
		link.children[0].type === 'text' &&
		link.children[0].value === link.url
	) {
		return link.url;
	}
	return null;
}

function buildCardHtml(url, entry) {
	const safeUrl = escapeHtml(url);
	const host = escapeHtml(getHost(url));

	// 无缓存或抓取失败：fallback 文本卡（保留链接 + 显示 URL）
	if (!entry || entry.status === 'failed') {
		return (
			`<a class="link-card link-card-fallback" href="${safeUrl}" target="_blank" rel="noopener">` +
			`<div class="link-card-body">` +
			`<div class="link-card-title">${safeUrl}</div>` +
			`<div class="link-card-meta"><span class="link-card-host">${host}</span></div>` +
			`</div></a>`
		);
	}

	const title = escapeHtml(entry.title || url);
	const desc = entry.description ? escapeHtml(entry.description) : '';
	const favicon = entry.favicon ? escapeHtml(entry.favicon) : '';
	const image = entry.image ? escapeHtml(entry.image) : '';

	return (
		`<a class="link-card" href="${safeUrl}" target="_blank" rel="noopener">` +
		`<div class="link-card-body">` +
		`<div class="link-card-title">${title}</div>` +
		(desc ? `<div class="link-card-desc">${desc}</div>` : '') +
		`<div class="link-card-meta">` +
		(favicon
			? `<img class="link-card-favicon" src="${favicon}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
			: '') +
		`<span class="link-card-host">${host}</span>` +
		`</div></div>` +
		(image
			? `<div class="link-card-image"><img src="${image}" alt="" loading="lazy" referrerpolicy="no-referrer" /></div>`
			: '') +
		`</a>`
	);
}

export default function remarkLinkCard() {
	const cache = loadCache();
	return (tree) => {
		visit(tree, 'paragraph', (node, _index, parent) => {
			const url = extractBareLinkUrl(node);
			if (!url) return;
			if (!parent) return;
			const idx = parent.children.indexOf(node);
			if (idx === -1) return;
			parent.children[idx] = {
				type: 'html',
				value: buildCardHtml(url, cache[url]),
			};
		});
	};
}
