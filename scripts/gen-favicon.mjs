import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'src/assets/elysia.png';
const OUT = 'public';

mkdirSync(OUT, { recursive: true });

const sizes = [
	{ name: 'favicon-16.png', size: 16 },
	{ name: 'favicon-32.png', size: 32 },
	{ name: 'favicon-192.png', size: 192 },
	{ name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
	await sharp(SRC).resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(`${OUT}/${name}`);
	console.log(`✓ ${name} (${size}x${size})`);
}
