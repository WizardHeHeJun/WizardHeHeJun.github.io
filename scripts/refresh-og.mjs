// 抓取 friends.json + 博文中独占段落的裸 URL 的 OpenGraph / Twitter / favicon 元数据
// 缓存到 src/data/og-cache.json，被 friends.astro 和 plugins/remark-link-card.mjs 共用
// 默认增量：只抓未缓存或 status='failed' 的 URL；--force 重抓全部
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';

const FRIENDS_FILE = 'src/data/friends.json';
const BLOG_DIR = 'src/content/blog';
const CACHE_FILE = 'src/data/og-cache.json';
const UA = 'Mozilla/5.0 (compatible; WizardHeHeJun-Blog-OG/1.0)';
const TIMEOUT_MS = 8000;
const MAX_REDIRECTS = 3;

const force = process.argv.includes('--force');

const friends = JSON.parse(readFileSync(FRIENDS_FILE, 'utf8'));
const cache = existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {};

// 从所有博文里抽出「段落只含一个裸 URL」的 URL
// 规则：剥 frontmatter + 剥 ``` 代码块 → 按空行切段 → 整段仅匹配 URL 才收
const URL_LINE_RE = /^<?(https?:\/\/[^\s<>]+)>?$/;
function extractBlogUrls() {
	if (!existsSync(BLOG_DIR)) return [];
	const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
	const urls = new Set();
	for (const f of files) {
		const md = readFileSync(`${BLOG_DIR}/${f}`, 'utf8');
		const body = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
		const noCode = body.replace(/```[\s\S]*?```/g, '');
		const blocks = noCode.split(/\r?\n\s*\r?\n/);
		for (const blk of blocks) {
			const trimmed = blk.trim();
			const m = URL_LINE_RE.exec(trimmed);
			if (m) urls.add(m[1]);
		}
	}
	return [...urls];
}

const friendUrls = friends.map((f) => f.url).filter(Boolean);
const blogUrls = extractBlogUrls();
const urls = [...new Set([...friendUrls, ...blogUrls])];
const todo = force ? urls : urls.filter((u) => !cache[u] || cache[u].status === 'failed');
console.log(
	`To fetch: ${todo.length} / ${urls.length}  ` +
		`(friends=${friendUrls.length}, blog=${blogUrls.length})${force ? '  --force' : ''}`,
);

if (todo.length === 0) {
	console.log('Nothing to do.');
	process.exit(0);
}

function absUrl(href, baseUrl) {
	try {
		return new URL(href, baseUrl).href;
	} catch {
		return href;
	}
}

function extractMeta(html, key) {
	// 匹配 property=key|name=key 在 content 之前 或之后两种写法
	const escKey = key.replace(/[/:]/g, (c) => '\\' + c);
	const re1 = new RegExp(
		`<meta\\s+(?:[^>]*?\\s+)?(?:property|name)=["']${escKey}["'][^>]*?\\s+content=["']([^"']+)["']`,
		'i',
	);
	const re2 = new RegExp(
		`<meta\\s+(?:[^>]*?\\s+)?content=["']([^"']+)["'][^>]*?\\s+(?:property|name)=["']${escKey}["']`,
		'i',
	);
	const m = re1.exec(html) || re2.exec(html);
	return m ? m[1] : undefined;
}

function parseMeta(html, baseUrl) {
	const out = { url: baseUrl };
	// 图片优先级
	for (const k of ['og:image', 'twitter:image', 'twitter:image:src']) {
		const v = extractMeta(html, k);
		if (v) {
			out.image = absUrl(v, baseUrl);
			break;
		}
	}
	// 标题
	out.title = extractMeta(html, 'og:title');
	if (!out.title) {
		const m = /<title>([\s\S]*?)<\/title>/i.exec(html);
		if (m) out.title = m[1].trim();
	}
	// 描述
	out.description = extractMeta(html, 'og:description') || extractMeta(html, 'description');
	// favicon：rel=icon / rel=shortcut icon / rel=apple-touch-icon 优先，fallback /favicon.ico
	const iconRe =
		/<link\s+(?:[^>]*?\s+)?rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*?\s+href=["']([^"']+)["']/i;
	const iconRe2 =
		/<link\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*?\s+rel=["'](?:icon|shortcut icon|apple-touch-icon)["']/i;
	const im = iconRe.exec(html) || iconRe2.exec(html);
	out.favicon = absUrl(im ? im[1] : '/favicon.ico', baseUrl);
	return out;
}

async function fetchWithRedirect(url, depth = 0) {
	if (depth > MAX_REDIRECTS) throw new Error('Too many redirects');
	const ctrl = new AbortController();
	const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml' },
			redirect: 'manual',
			signal: ctrl.signal,
		});
		if (res.status >= 300 && res.status < 400) {
			const loc = res.headers.get('location');
			if (!loc) throw new Error('Redirect missing Location');
			return fetchWithRedirect(new URL(loc, url).href, depth + 1);
		}
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const html = await res.text();
		return { html, finalUrl: url };
	} finally {
		clearTimeout(timer);
	}
}

for (const url of todo) {
	process.stdout.write(`  ${url} ... `);
	try {
		const { html, finalUrl } = await fetchWithRedirect(url);
		const parsed = parseMeta(html, finalUrl);
		const hasImage = !!parsed.image;
		const hasAny = !!(parsed.image || parsed.title || parsed.description);
		cache[url] = {
			url,
			image: parsed.image,
			title: parsed.title,
			description: parsed.description,
			favicon: parsed.favicon,
			fetchedAt: new Date().toISOString(),
			status: hasImage ? 'ok' : hasAny ? 'partial' : 'failed',
		};
		console.log(cache[url].status + (hasImage ? ' [image]' : hasAny ? ' [no-image]' : ''));
	} catch (e) {
		cache[url] = {
			url,
			fetchedAt: new Date().toISOString(),
			status: 'failed',
			error: String(e.message || e),
		};
		console.log(`failed (${cache[url].error})`);
	}
}

writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n', 'utf8');
console.log(`\n✓ ${Object.keys(cache).length} entries in ${CACHE_FILE}`);
