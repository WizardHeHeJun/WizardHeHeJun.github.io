// 交互式新建博文：prompt 标题/slug/分类/标签/置顶/描述，scaffold 一个 .md 到 src/content/blog/
// 自管理 stdin 行队列，兼容 TTY 交互 + piped 测试（避免 readline.question 在 piped EOF 后立即 close 的坑）
import { existsSync, writeFileSync } from 'node:fs';
import { stdin as input, stdout as output } from 'node:process';
import { join } from 'node:path';

const CATEGORIES = ['项目分享', '技术笔记', '学习总结', '生活随笔', '碎碎念'];
const BLOG_DIR = 'src/content/blog';

input.setEncoding('utf8');
let lineBuffer = '';
const linesReady = [];
const lineWaiters = [];
let inputClosed = false;

input.on('data', (chunk) => {
	lineBuffer += chunk;
	let nl;
	while ((nl = lineBuffer.indexOf('\n')) !== -1) {
		const line = lineBuffer.slice(0, nl).replace(/\r$/, '');
		lineBuffer = lineBuffer.slice(nl + 1);
		if (lineWaiters.length > 0) lineWaiters.shift()(line);
		else linesReady.push(line);
	}
});

input.on('end', () => {
	inputClosed = true;
	if (lineBuffer.length > 0) {
		const tail = lineBuffer.replace(/\r$/, '');
		lineBuffer = '';
		if (lineWaiters.length > 0) lineWaiters.shift()(tail);
		else linesReady.push(tail);
	}
	while (lineWaiters.length > 0) lineWaiters.shift()(null);
});

function readLine() {
	return new Promise((resolve) => {
		if (linesReady.length > 0) resolve(linesReady.shift());
		else if (inputClosed) resolve(null);
		else lineWaiters.push(resolve);
	});
}

async function ask(question, fallback = '') {
	const hint = fallback ? ` (${fallback})` : '';
	output.write(`${question}${hint}: `);
	const line = await readLine();
	return (line ?? '').trim() || fallback;
}

function slugify(s) {
	return s
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function formatDate(d) {
	// 跟现有博文一致：'May 12 2026'（无逗号）
	const m = d.toLocaleDateString('en-US', { month: 'short' });
	const day = String(d.getDate()).padStart(2, '0');
	return `${m} ${day} ${d.getFullYear()}`;
}

const title = await ask('标题');
if (!title) {
	console.error('× 标题不能为空');
	process.exit(1);
}

const slugSuggestion = slugify(title) || `post-${Date.now()}`;
const slug = await ask('slug (英文，按回车用默认)', slugSuggestion);

const target = join(BLOG_DIR, `${slug}.md`);
if (existsSync(target)) {
	console.error(`× 文件已存在：${target}`);
	process.exit(1);
}

output.write('\n分类：\n');
CATEGORIES.forEach((c, i) => output.write(`  [${i + 1}] ${c}\n`));
const catIdx = parseInt(await ask('选择分类 (1-5)', '1'), 10);
const category = CATEGORIES[catIdx - 1] || CATEGORIES[0];

const tagsRaw = await ask('标签 (英文逗号分隔，可空)');
const tags = tagsRaw
	.split(',')
	.map((t) => t.trim())
	.filter(Boolean);

const featuredRaw = (await ask('置顶？(y/N)', 'N')).toLowerCase();
const featured = featuredRaw === 'y' || featuredRaw === 'yes';

const descriptionFallback = title.length > 60 ? title.slice(0, 60) : title;
const description = await ask('描述 (~30 字内，可空)', descriptionFallback);

const pubDate = formatDate(new Date());
const tagsLine = tags.length > 0 ? `[${tags.map((t) => `'${t}'`).join(', ')}]` : '[]';

const frontmatter = [
	'---',
	`title: '${title.replace(/'/g, "''")}'`,
	`description: '${description.replace(/'/g, "''")}'`,
	`pubDate: '${pubDate}'`,
	`category: '${category}'`,
	`tags: ${tagsLine}`,
	...(featured ? ['featured: true'] : []),
	`# heroImage: '../../assets/blog/${slug}.jpg'`,
	'---',
	'',
	'',
].join('\n');

writeFileSync(target, frontmatter, 'utf8');

console.log(`\n✓ 已创建：${target}`);
console.log(`  - 拖一张 hero 图到 src/assets/blog/${slug}.jpg 再取消注释 heroImage`);
console.log(`  - 写完跑 npm run build 验证，git push 自动部署`);

process.exit(0);
