// my-blog 交互式 CLI：新建博文 / 备份 / 还原 / 备份管理
// 设计：菜单驱动，"新建博文" 委托给现有的 scripts/new-post.mjs（保留其 stdin 处理）
//      备份/还原/清理 用本地 lib/backup.mjs 实现（基于 node-tar）
import * as p from '@clack/prompts';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	runBackup,
	runRestore,
	listBackups,
	cleanBackups,
	readManifest,
	formatBytes,
	formatRelTime,
} from './lib/backup.mjs';

const PROJECT_ROOT = resolve(fileURLToPath(import.meta.url), '../..');

function bail(msg) {
	p.cancel(msg);
	process.exit(0);
}

async function handleNew() {
	p.log.info('交给 scripts/new-post.mjs（保留其交互式 prompt）');
	const result = spawnSync(process.execPath, ['scripts/new-post.mjs'], {
		stdio: 'inherit',
		cwd: PROJECT_ROOT,
	});
	if (result.status !== 0) {
		p.log.warn(`new-post.mjs 退出码 ${result.status}`);
	}
}

async function handleBackup() {
	const mode = await p.select({
		message: '备份类型',
		options: [
			{ value: 'standard', label: '📦 标准', hint: 'content + data + config（文本，秒级）' },
			{ value: 'full', label: '🗜️  完整', hint: '含 hero 图 / memories / 背景图（可能 MB 级）' },
		],
	});
	if (p.isCancel(mode)) return;

	const spinner = p.spinner();
	spinner.start('打包中...');
	try {
		const r = await runBackup({ full: mode === 'full' });
		spinner.stop(`✓ 备份完成 → backups/${r.archive}`);
		p.log.info(
			`体积 ${formatBytes(r.size)} | 包含 ${r.items.length} 项${r.skipped.length ? ` | 跳过不存在 ${r.skipped.length} 项` : ''}`
		);
	} catch (e) {
		spinner.stop(`✗ 备份失败: ${e.message}`);
	}
}

async function handleRestore() {
	const all = listBackups();
	if (all.length === 0) {
		p.log.warn('没有可用的备份（backups/ 为空）');
		return;
	}

	const choice = await p.select({
		message: '选择要还原的备份',
		options: all.map((b) => ({
			value: b.path,
			label: b.name,
			hint: `${formatBytes(b.size)} · ${formatRelTime(b.mtime)}`,
		})),
	});
	if (p.isCancel(choice)) return;

	const spinner = p.spinner();
	spinner.start('读取 manifest...');
	const manifest = await readManifest(choice).catch(() => null);
	spinner.stop(manifest ? `manifest: ${manifest.type} · ${manifest.items.length} 项` : 'manifest 缺失（旧格式）');

	const confirm = await p.select({
		message: '⚠ 还原会覆盖现有文件，确认？',
		initialValue: 'cancel',
		options: [
			{ value: 'cancel', label: '取消' },
			{ value: 'safe', label: '先备份当前状态再还原（推荐）' },
			{ value: 'force', label: '直接还原（不备份）' },
		],
	});
	if (p.isCancel(confirm) || confirm === 'cancel') {
		p.log.info('已取消');
		return;
	}

	if (confirm === 'safe') {
		const s1 = p.spinner();
		s1.start('先备份当前状态...');
		try {
			const pre = await runBackup({ full: false });
			s1.stop(`✓ 当前状态已备份 → backups/${pre.archive}`);
		} catch (e) {
			s1.stop(`✗ 预备份失败: ${e.message}`);
			return;
		}
	}

	const s2 = p.spinner();
	s2.start('还原中...');
	try {
		const r = await runRestore(choice);
		s2.stop(`✓ 已还原 ${r.restored} 个文件`);
	} catch (e) {
		s2.stop(`✗ 还原失败: ${e.message}`);
	}
}

async function handleList() {
	const all = listBackups();
	if (all.length === 0) {
		p.log.info('暂无备份');
		return;
	}
	const total = all.reduce((s, b) => s + b.size, 0);
	p.log.info(`备份目录：backups/ · 共 ${all.length} 个 · ${formatBytes(total)}`);
	p.log.message(
		all
			.map((b) => `  ${b.name}   ${formatBytes(b.size).padStart(9)}   ${formatRelTime(b.mtime)}`)
			.join('\n')
	);
}

async function handleClean() {
	const all = listBackups();
	if (all.length <= 1) {
		p.log.info('备份数量 ≤ 1，无需清理');
		return;
	}
	const keepStr = await p.text({
		message: '保留最近几个备份？',
		placeholder: '5',
		initialValue: '5',
		validate: (v) => {
			const n = parseInt(v, 10);
			if (!Number.isFinite(n) || n < 1) return '必须是正整数';
		},
	});
	if (p.isCancel(keepStr)) return;
	const keep = parseInt(keepStr, 10);
	if (keep >= all.length) {
		p.log.info('保留数 ≥ 当前数量，无需清理');
		return;
	}

	const confirm = await p.confirm({
		message: `将删除 ${all.length - keep} 个旧备份，确认？`,
		initialValue: false,
	});
	if (p.isCancel(confirm) || !confirm) return;

	const r = cleanBackups({ keep });
	p.log.success(`✓ 删除 ${r.deleted.length} 个旧备份，保留 ${r.kept.length} 个`);
}

async function main() {
	p.intro('❀ my-blog tools');

	while (true) {
		const action = await p.select({
			message: '选择操作',
			options: [
				{ value: 'new', label: '✍  新建博文', hint: 'scaffold .md to src/content/blog/' },
				{ value: 'backup', label: '📦 备份', hint: '打包 content + config' },
				{ value: 'restore', label: '📂 还原', hint: '从备份还原' },
				{ value: 'list', label: '📋 备份列表' },
				{ value: 'clean', label: '🧹 清理旧备份', hint: '按 keep N 保留最近的' },
				{ value: 'quit', label: '👋 退出' },
			],
		});

		if (p.isCancel(action) || action === 'quit') {
			p.outro('再见～♪');
			break;
		}

		try {
			if (action === 'new') await handleNew();
			else if (action === 'backup') await handleBackup();
			else if (action === 'restore') await handleRestore();
			else if (action === 'list') await handleList();
			else if (action === 'clean') await handleClean();
		} catch (e) {
			p.log.error(`错误: ${e.message}`);
		}
		// 一次操作后停顿一下，避免菜单刷得太快
		p.log.message('');
	}
}

main().catch((e) => bail(`致命错误: ${e.message}`));
