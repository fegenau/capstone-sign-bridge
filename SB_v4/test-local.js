#!/usr/bin/env node

/**
 * Prueba local de SB_v4
 * Verifica que todos los archivos críticos estén presentes y sean válidos
 */

const fs = require('fs');
const path = require('path');

console.log('\n🧪 TEST LOCAL - SB_v4 Chilean Sign Language Detection\n');
console.log('=' .repeat(60));

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (e) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${e.message}`);
    failedTests++;
  }
}

// 1. Verificar archivos críticos
console.log('\n📁 ARCHIVOS CRÍTICOS');
console.log('-'.repeat(60));

test('public/model/model.json existe', () => {
  const file = path.join(__dirname, 'public/model/model.json');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const size = fs.statSync(file).size;
  console.log(`   Tamaño: ${(size / 1024).toFixed(1)} KB`);
});

test('public/model/group1-shard1of1.bin existe', () => {
  const file = path.join(__dirname, 'public/model/group1-shard1of1.bin');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const size = fs.statSync(file).size;
  console.log(`   Tamaño: ${(size / (1024*1024)).toFixed(1)} MB`);
});

test('public/labels.json existe y es válido', () => {
  const file = path.join(__dirname, 'public/labels.json');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (!data.classes || !Array.isArray(data.classes)) {
    throw new Error('Estructura inválida');
  }
  console.log(`   Clases: ${data.classes.length}`);
  // El modelo tiene 67 salidas (10 dígitos + 26 letras + 31 frases)
  if (data.classes.length < 50) {
    throw new Error(`Se esperaban ≥50 clases, se encontraron ${data.classes.length}`);
  }
});

test('public/manual/ tiene 67 SVGs', () => {
  const dir = path.join(__dirname, 'public/manual');
  if (!fs.existsSync(dir)) throw new Error('Directorio no encontrado');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
  if (files.length !== 67) {
    throw new Error(`Se esperaban 67 SVGs, se encontraron ${files.length}`);
  }
  console.log(`   SVGs: ${files.length}`);
});

// 2. Verificar hooks
console.log('\n🎣 HOOKS (Lógica de Aplicación)');
console.log('-'.repeat(60));

test('hooks/useTfjsClassifier.js existe', () => {
  const file = path.join(__dirname, 'hooks/useTfjsClassifier.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('tf.loadLayersModel')) {
    throw new Error('Hook no carga modelo TFJS');
  }
  if (!content.includes('classify')) {
    throw new Error('Hook no tiene función classify');
  }
});

test('hooks/useMediaPipeDetection.js existe', () => {
  const file = path.join(__dirname, 'hooks/useMediaPipeDetection.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('MediaPipe')) {
    throw new Error('Hook no usa MediaPipe');
  }
  if (!content.includes('FRAME_BUFFER_SIZE')) {
    throw new Error('Hook no implementa buffer de frames');
  }
});

// 3. Verificar utilidades
console.log('\n⚙️ UTILIDADES');
console.log('-'.repeat(60));

test('utils/smoothPrediction.js existe', () => {
  const file = path.join(__dirname, 'utils/smoothPrediction.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('PredictionSmoother')) {
    throw new Error('Clase PredictionSmoother no encontrada');
  }
});

test('utils/debounce.js existe', () => {
  const file = path.join(__dirname, 'utils/debounce.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('debounce')) {
    throw new Error('Función debounce no encontrada');
  }
});

// 4. Verificar pantallas
console.log('\n📱 PANTALLAS (UI)');
console.log('-'.repeat(60));

test('screens/DetectScreen.js mejorado', () => {
  const file = path.join(__dirname, 'screens/DetectScreen.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('PredictionSmoother')) {
    throw new Error('No incluye suavizado de predicciones');
  }
  if (!content.includes('confidenceBar')) {
    throw new Error('No incluye barra de confianza');
  }
});

test('screens/SettingsScreen.js con controles', () => {
  const file = path.join(__dirname, 'screens/SettingsScreen.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('confidenceThreshold')) {
    throw new Error('No incluye control de umbral de confianza');
  }
  if (!content.includes('smootherQueueLength')) {
    throw new Error('No incluye control de estabilidad');
  }
});

test('screens/ManualScreen.js existe', () => {
  const file = path.join(__dirname, 'screens/ManualScreen.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
});

// 5. Verificar configuración
console.log('\n⚙️ CONFIGURACIÓN');
console.log('-'.repeat(60));

test('App.js tiene navegación por pestañas', () => {
  const file = path.join(__dirname, 'App.js');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('home') || !content.includes('detect') ||
      !content.includes('manual') || !content.includes('settings')) {
    throw new Error('No tiene todas las pestañas');
  }
});

test('app.json tiene configuración válida', () => {
  const file = path.join(__dirname, 'app.json');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (!data.expo || !data.expo.plugins) {
    throw new Error('Estructura inválida');
  }
  // Verificar que NO tiene expo-speech en plugins (causaba error)
  const hasExpoSpeech = data.expo.plugins.some(p =>
    p === 'expo-speech' || (Array.isArray(p) && p[0] === 'expo-speech')
  );
  if (hasExpoSpeech) {
    throw new Error('expo-speech plugin causaba error, debería estar removido');
  }
});

test('package.json tiene build correcto', () => {
  const file = path.join(__dirname, 'package.json');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (!data.scripts || !data.scripts.build) {
    throw new Error('No hay script build');
  }
  if (!data.scripts.build.includes('expo export')) {
    throw new Error('Build script no usa expo export');
  }
  if (!data.scripts.build.includes('copy-public.js')) {
    throw new Error('Build script no copia archivos públicos');
  }
});

// 6. Verificar dependencias
console.log('\n📦 DEPENDENCIAS');
console.log('-'.repeat(60));

test('TensorFlow.js instalado', () => {
  const file = path.join(__dirname, 'package.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (!data.dependencies['@tensorflow/tfjs']) {
    throw new Error('@tensorflow/tfjs no está en dependencias');
  }
});

test('MediaPipe instalado', () => {
  const file = path.join(__dirname, 'package.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (!data.dependencies['@mediapipe/tasks-vision']) {
    throw new Error('@mediapipe/tasks-vision no está en dependencias');
  }
});

test('expo-speech instalado', () => {
  const file = path.join(__dirname, 'package.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  if (!data.dependencies['expo-speech']) {
    throw new Error('expo-speech no está en dependencias');
  }
});

// 7. Verificar documentación
console.log('\n📚 DOCUMENTACIÓN');
console.log('-'.repeat(60));

test('README.md existe y es completo', () => {
  const file = path.join(__dirname, 'README.md');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n').length;
  console.log(`   Líneas: ${lines}`);
  if (lines < 100) {
    throw new Error('README muy corto');
  }
  if (!content.includes('Firebase')) {
    throw new Error('README no incluye instrucciones de Firebase');
  }
  if (!content.includes('npm run start')) {
    throw new Error('README no incluye instrucciones de ejecución local');
  }
});

test('QA_CHECKLIST.md existe', () => {
  const file = path.join(__dirname, 'QA_CHECKLIST.md');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
  const content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('Pre-Test Setup')) {
    throw new Error('Checklist incompleto');
  }
});

test('IMPLEMENTATION_SUMMARY.md existe', () => {
  const file = path.join(__dirname, 'IMPLEMENTATION_SUMMARY.md');
  if (!fs.existsSync(file)) throw new Error('Archivo no encontrado');
});

// RESUMEN
console.log('\n' + '='.repeat(60));
console.log('\n📊 RESULTADOS:\n');
console.log(`✅ Pruebas pasadas: ${passedTests}`);
console.log(`❌ Pruebas fallidas: ${failedTests}`);
console.log(`📈 Porcentaje: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ¡TODAS LAS PRUEBAS PASARON! La aplicación está lista.\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  Hay ${failedTests} prueba(s) que fallaron. Revisa arriba.\n`);
  process.exit(1);
}
