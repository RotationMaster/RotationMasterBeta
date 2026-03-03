import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const imgDir = join(root, 'src/assets/resource/abilities');
if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true });

// Step 1: Transform pvme.json → abilities.json
const pvme = JSON.parse(readFileSync(join(root, 'src/assets/pvme.json'), 'utf8'));

const abilities = [];

for (const category of pvme.categories) {
  for (const emoji of category.emojis) {
    if (!emoji.emoji_id) continue;
    const localDisk = join(imgDir, `${emoji.id}.webp`);
    abilities.push({
      Title: emoji.id,
      Src: existsSync(localDisk)
        ? `./assets/resource/abilities/${emoji.id}.webp`
        : `https://cdn.discordapp.com/emojis/${emoji.emoji_id}.webp`,
      Emoji: emoji.name,
      EmojiId: emoji.emoji_id,
      Category: category.name,
    });
  }
}

const outPath = join(root, 'src/assets/abilities.json');
writeFileSync(outPath, JSON.stringify(abilities, null, 2));
console.log(`✓ Written ${abilities.length} abilities to ${outPath}`);

// Step 2: Download missing images, then re-write JSON with local paths
let downloaded = 0;
let skipped = 0;
let failed = 0;

for (const ability of abilities) {
  const dest = join(imgDir, `${ability.Title}.webp`);
  if (existsSync(dest)) {
    skipped++;
    continue;
  }

  try {
    const res = await fetch(ability.Src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    writeFileSync(dest, Buffer.from(buf));
    ability.Src = `./assets/resource/abilities/${ability.Title}.webp`;
    downloaded++;
    process.stdout.write(`\r  Downloading... ${downloaded + skipped}/${abilities.length}`);
  } catch (err) {
    console.error(`\n  ✗ Failed ${ability.Title}: ${err.message}`);
    failed++;
  }
}

if (downloaded > 0) {
  writeFileSync(outPath, JSON.stringify(abilities, null, 2));
  console.log(`\n✓ Updated src paths for ${downloaded} newly downloaded images`);
}

console.log(`✓ Done. Downloaded: ${downloaded}, Skipped (already exist): ${skipped}, Failed: ${failed}`);
