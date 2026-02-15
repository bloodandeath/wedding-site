/**
 * Generate LQIP (Low Quality Image Placeholder) base64 thumbnails.
 *
 * Usage:  node scripts/generate-lqip.mjs
 *
 * Outputs base64 data URIs for every image in public/gallery/ and public/registry/.
 * Paste the results into siteContent.js (gallery) and registry.amazon.json (registry).
 */

import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

const DIRS = [
  { label: "gallery",  path: join(ROOT, "public", "gallery") },
  { label: "registry", path: join(ROOT, "public", "registry") },
];

const IMG_RE = /\.(jpe?g|png|webp|avif)$/i;

for (const { label, path: dir } of DIRS) {
  console.log(`\n── ${label} (${ dir }) ──\n`);

  let files;
  try {
    files = (await readdir(dir)).filter(f => IMG_RE.test(f)).sort();
  } catch {
    console.log("  (directory not found, skipping)");
    continue;
  }

  for (const file of files) {
    const buf = await sharp(join(dir, file))
      .resize(20)              // 20px wide, auto height
      .jpeg({ quality: 40 })
      .toBuffer();

    const b64 = `data:image/jpeg;base64,${buf.toString("base64")}`;
    console.log(`"${file}": "${b64}",`);
  }
}

console.log("\nDone.");
