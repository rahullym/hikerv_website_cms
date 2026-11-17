// Resizes oversized WebP assets in place so they never exceed a sensible display width.
// Usage: node scripts/optimize-images.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const targets = {
  'public/hikerv.webp': 800,
  'public/philosophybg.webp': 1920,
  'public/drifterbg.webp': 1920,
  'public/aboutusbg.webp': 1920,
  'public/chasis1.webp': 1280,
  'public/solar.webp': 1280,
  'public/suspenison.webp': 1280,
  'public/craft.webp': 1280,
  'public/approved.webp': 1280,
  'public/huttle/exterior.webp': 1920,
  'src/assets/elite-series.webp': 1920,
  'src/assets/drifter-series.webp': 1920,
  'src/assets/rover-series.webp': 1920,
};

for (const [file, width] of Object.entries(targets)) {
  const input = fs.readFileSync(file);
  const meta = await sharp(input).metadata();
  const out = await sharp(input)
    .resize({ width: Math.min(width, meta.width) })
    .webp({ quality: 70, effort: 6 })
    .toBuffer();
  if (out.length < input.length) fs.writeFileSync(file, out);
  const m = await sharp(fs.readFileSync(file)).metadata();
  console.log(file, `${m.width}x${m.height}`, fs.statSync(file).size);
}
