#!/usr/bin/env node

/**
 * EAS Build Post-Install Hook
 * Copia el modelo TFLite a la ubicación correcta de Android assets
 * Se ejecuta automáticamente durante el build en EAS
 */

const fs = require('fs');
const path = require('path');

console.log('📦 EAS Build: Post-install hook ejecutándose...');

try {
  // Rutas
  const sourceModel = path.join(__dirname, '..', 'assets', 'Modelo', 'best_float16.tflite');
  const androidAssetsDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'Modelo');
  const targetModel = path.join(androidAssetsDir, 'best_float16.tflite');

  // Verificar que el modelo fuente existe
  if (!fs.existsSync(sourceModel)) {
    console.error('❌ Error: Modelo fuente no encontrado en:', sourceModel);
    process.exit(1);
  }

  const modelStats = fs.statSync(sourceModel);
  console.log(`✅ Modelo fuente encontrado: ${(modelStats.size / 1024 / 1024).toFixed(2)} MB`);

  // Crear directorio de destino si no existe
  if (!fs.existsSync(androidAssetsDir)) {
    console.log('📁 Creando directorio de assets:', androidAssetsDir);
    fs.mkdirSync(androidAssetsDir, { recursive: true });
  }

  // Copiar modelo
  console.log('📋 Copiando modelo a Android assets...');
  fs.copyFileSync(sourceModel, targetModel);

  // Verificar copia
  if (fs.existsSync(targetModel)) {
    const copiedStats = fs.statSync(targetModel);
    console.log(`✅ Modelo copiado exitosamente: ${(copiedStats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`📍 Ubicación: ${targetModel}`);
  } else {
    throw new Error('Modelo no se copió correctamente');
  }

  console.log('🎉 Post-install hook completado exitosamente');
  process.exit(0);

} catch (error) {
  console.error('❌ Error en post-install hook:', error.message);
  console.error(error.stack);
  process.exit(1);
}
