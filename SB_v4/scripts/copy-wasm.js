#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Crear directorio public/wasm si no existe
const wasmDir = path.join(__dirname, '..', 'public', 'wasm');
if (!fs.existsSync(wasmDir)) {
  fs.mkdirSync(wasmDir, { recursive: true });
  console.log('✅ Directorio creado:', wasmDir);
}

// Archivos a copiar
const files = [
  'vision_wasm_internal.js',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.wasm'
];

const sourceDir = path.join(__dirname, '..', 'node_modules', '@mediapipe', 'tasks-vision', 'wasm');

files.forEach(file => {
  const src = path.join(sourceDir, file);
  const dest = path.join(wasmDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado: ${file}`);
  } else {
    console.warn(`⚠️  No encontrado: ${file}`);
  }
});

console.log('\n✅ WASM files copiados a public/wasm/');
