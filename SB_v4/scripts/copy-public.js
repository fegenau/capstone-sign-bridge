// Copy SB_v4/public/** into SB_v4/dist after export:web
const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '..', 'public');
const outDir = path.resolve(__dirname, '..', 'dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyRecursive(srcDir, outDir);
console.log('[copy-public] Copiado public/** a dist/');
