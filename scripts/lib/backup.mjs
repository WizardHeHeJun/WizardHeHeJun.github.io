// 备份 / 还原 / 列举 / 清理：基于 node-tar 的 tar.gz 打包
// 核心安全：还原前先 dry-list 校验路径（拒绝 .. / 绝对路径 / null byte）
import {
	existsSync,
	statSync,
	mkdirSync,
	readdirSync,
	rmSync,
	writeFileSync,
	createReadStream,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { create as tarCreate, extract as tarExtract, list as tarList } from 'tar';

const PROJECT_ROOT = resolve(fileURLToPath(import.meta.url), '../../..');
const BACKUP_DIR = resolve(PROJECT_ROOT, 'backups');

// required 必备份；optional 仅 --full 时备份。所有路径相对 PROJECT_ROOT。
const BACKUP_ITEMS = {
	required: [
		'src/content/blog',
		'src/data',
		'src/consts.ts',
		'src/content.config.ts',
		'astro.config.mjs',
		'CLAUDE.md',
		'package.json',
	],
	optional: [
		'src/assets/blog',
		'src/assets/bg.jpg',
		'src/assets/elysia.png',
		'public/memories',
	],
};

function tsStamp() {
	return new Date().toISOString().replace(/[:.]/g, '-');
}

export function formatBytes(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function formatRelTime(ms) {
	const sec = Math.max(0, (Date.now() - ms) / 1000);
	if (sec < 60) return `${Math.floor(sec)} 秒前`;
	if (sec < 3600) return `${Math.floor(sec / 60)} 分钟前`;
	if (sec < 86400) return `${Math.floor(sec / 3600)} 小时前`;
	return `${Math.floor(sec / 86400)} 天前`;
}

export async function runBackup({ full = false } = {}) {
	if (!existsSync(BACKUP_DIR)) mkdirSync(BACKUP_DIR, { recursive: true });

	const items = full
		? [...BACKUP_ITEMS.required, ...BACKUP_ITEMS.optional]
		: [...BACKUP_ITEMS.required];

	const existing = items.filter((p) => existsSync(resolve(PROJECT_ROOT, p)));
	const skipped = items.filter((p) => !existsSync(resolve(PROJECT_ROOT, p)));

	if (existing.length === 0) {
		throw new Error('没有可备份的文件');
	}

	const ts = tsStamp();
	const archiveName = `backup-${ts}.tar.gz`;
	const archivePath = resolve(BACKUP_DIR, archiveName);
	const manifestName = `.backup-manifest-${ts}.json`;
	const manifestPath = resolve(PROJECT_ROOT, manifestName);

	const manifest = {
		name: 'my-blog-backup',
		version: 1,
		type: full ? 'full' : 'standard',
		createdAt: new Date().toISOString(),
		items: existing,
		skipped,
	};
	writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

	try {
		await tarCreate(
			{
				gzip: true,
				file: archivePath,
				cwd: PROJECT_ROOT,
			},
			[...existing, manifestName]
		);
	} finally {
		rmSync(manifestPath, { force: true });
	}

	const size = statSync(archivePath).size;
	return { archive: archiveName, path: archivePath, size, items: existing, skipped };
}

export function listBackups() {
	if (!existsSync(BACKUP_DIR)) return [];
	return readdirSync(BACKUP_DIR)
		.filter((f) => f.endsWith('.tar.gz'))
		.map((f) => {
			const fullPath = join(BACKUP_DIR, f);
			const stat = statSync(fullPath);
			return {
				name: f,
				path: fullPath,
				size: stat.size,
				mtime: stat.mtimeMs,
			};
		})
		.sort((a, b) => b.mtime - a.mtime);
}

// 读取 archive 内嵌的 manifest（如有）。用于 restore 前预览。
export async function readManifest(archivePath) {
	let manifest = null;
	await tarList({
		file: archivePath,
		onentry: (entry) => {
			if (!entry.path.startsWith('.backup-manifest-')) return entry.resume();
			const chunks = [];
			entry.on('data', (c) => chunks.push(c));
			entry.on('end', () => {
				try {
					manifest = JSON.parse(Buffer.concat(chunks).toString('utf8'));
				} catch {
					/* ignore */
				}
			});
		},
	});
	return manifest;
}

// dry-list 列出 archive 所有路径，做安全校验（不解压）。
// 拒绝 .. / 绝对路径 / null byte——防 zip-slip 类攻击。
export async function listArchiveEntries(archivePath) {
	const entries = [];
	await tarList({
		file: archivePath,
		onentry: (entry) => {
			entries.push(entry.path);
			entry.resume();
		},
	});
	return entries;
}

export function validateEntries(entries) {
	for (const p of entries) {
		if (p.includes('..')) throw new Error(`不安全路径（含 ..）: ${p}`);
		if (p.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(p)) {
			throw new Error(`不安全路径（绝对路径）: ${p}`);
		}
		if (p.includes('\0')) throw new Error(`不安全路径（null byte）: ${p}`);
	}
}

export async function runRestore(archivePath) {
	const entries = await listArchiveEntries(archivePath);
	validateEntries(entries);
	await tarExtract({
		file: archivePath,
		cwd: PROJECT_ROOT,
	});
	// 还原后顺手清掉 archive 顶层的 .backup-manifest-*.json（它本来就是元数据）
	for (const e of entries) {
		if (e.startsWith('.backup-manifest-')) {
			rmSync(resolve(PROJECT_ROOT, e), { force: true });
		}
	}
	return { entries, restored: entries.filter((e) => !e.startsWith('.backup-manifest-')).length };
}

export function cleanBackups({ keep = 5 }) {
	const all = listBackups();
	const toDelete = all.slice(keep);
	for (const b of toDelete) {
		rmSync(b.path, { force: true });
	}
	return { kept: all.slice(0, keep), deleted: toDelete };
}

export { PROJECT_ROOT, BACKUP_DIR, BACKUP_ITEMS };
