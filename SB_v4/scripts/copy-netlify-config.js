#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Copiar archivos de configuración de Netlify a dist/
const files = ['_headers', 'netlify.toml'];
const distDir = path.join(__dirname, '..', 'dist');

files.forEach(file => {
  const src = path.join(__dirname, '..', file);
  const dest = path.join(distDir, file);

  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado: ${file} → dist/`);
  } else {
    console.warn(`⚠️  No encontrado: ${file}`);
  }
});

console.log('\n✅ Archivos de configuración de Netlify copiados a dist/');
