// 为 src/assets/blog/*.{jpg,png,webp} 生成 LQIP（Low Quality Image Placeholder）
// 输出 src/data/lqip.json：{ "<slug>": { "lqip": "data:image/jpeg;base64,...", "color": "#rrggbb" } }
import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';

const SRC_DIR = 'src/assets/blog';
const OUT_FILE = 'src/data/lqip.json';
const LQIP_WIDTH = 32;
const LQIP_QUALITY = 40;

const files = readdirSync(SRC_DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const result = {};

for (const f of files) {
	const slug = parse(f).name;
	const buf = readFileSync(join(SRC_DIR, f));
	const meta = await sharp(buf).metadata();
	const ratio = meta.height / meta.width;
	const h = Math.max(8, Math.round(LQIP_WIDTH * ratio));

	const tiny = await sharp(buf)
		.resize(LQIP_WIDTH, h, { fit: 'cover' })
		.jpeg({ quality: LQIP_QUALITY })
		.toBuffer();

	const { dominant } = await sharp(buf).stats();
	const color =
		'#' +
		[dominant.r, dominant.g, dominant.b]
			.map((v) => v.toString(16).padStart(2, '0'))
			.join('');

	result[slug] = {
		lqip: `data:image/jpeg;base64,${tiny.toString('base64')}`,
		color,
	};
	console.log(`✓ ${f}  ${meta.width}x${meta.height} → ${LQIP_WIDTH}x${h}  ${color}  ${tiny.length}B`);
}

const outDir = parse(OUT_FILE).dir;
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(OUT_FILE, JSON.stringify(result, null, 2));
console.log(`\nWrote ${Object.keys(result).length} entries to ${OUT_FILE}`);
