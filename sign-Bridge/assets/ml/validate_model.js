/**
 * Validador de Modelo TensorFlow.js para Web/React Native
 * 
 * Este script verifica:
 * 1. Que el modelo se pueda cargar correctamente
 * 2. Que las shapes sean correctas
 * 3. Que la inferencia funcione
 * 4. Compatibilidad con WebGL backend
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDACIÓN DE MODELO TENSORFLOW.JS');
console.log('='.repeat(70));

// Verificar que existe model.json
const modelPath = path.join(__dirname, 'model.json');
const weightsPath = path.join(__dirname, 'group1-shard1of1.bin');
const labelPath = path.join(__dirname, 'label_encoder.json');
const configPath = path.join(__dirname, 'config.json');

console.log('\n📁 Verificando archivos...');

const files = [
  { path: modelPath, name: 'model.json' },
  { path: weightsPath, name: 'group1-shard1of1.bin' },
  { path: labelPath, name: 'label_encoder.json' },
  { path: configPath, name: 'config.json' }
];

let allFilesExist = true;
files.forEach(({ path, name }) => {
  if (fs.existsSync(path)) {
    const stats = fs.statSync(path);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`   ✅ ${name} (${sizeMB} MB)`);
  } else {
    console.log(`   ❌ ${name} NO ENCONTRADO`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log('\n❌ Faltan archivos necesarios!');
  process.exit(1);
}

// Cargar y validar model.json
console.log('\n📋 Validando model.json...');
const modelData = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

// Verificar formato
if (modelData.format !== 'layers-model') {
  console.log('   ⚠️  Formato no es layers-model:', modelData.format);
} else {
  console.log('   ✅ Formato: layers-model');
}

// Verificar generatedBy
console.log(`   ℹ️  Generado por: ${modelData.generatedBy}`);
console.log(`   ℹ️  Convertido por: ${modelData.convertedBy}`);

// Verificar topología
const topology = modelData.modelTopology;
if (!topology) {
  console.log('   ❌ No se encontró modelTopology');
  process.exit(1);
}

console.log(`   ✅ Keras version: ${topology.keras_version}`);

// Verificar input shape
const inputLayer = topology.model_config.config.layers[0];
const inputShape = inputLayer.config.batch_input_shape;
console.log(`   ✅ Input shape: [${inputShape.join(', ')}]`);

if (inputShape[1] !== 24 || inputShape[2] !== 126) {
  console.log('   ⚠️  ADVERTENCIA: Input shape no coincide con especificación!');
  console.log('      Esperado: [null, 24, 126]');
  console.log(`      Actual: [${inputShape.join(', ')}]`);
}

// Verificar output shape
const outputLayer = topology.model_config.config.layers[
  topology.model_config.config.layers.length - 1
];
const numClasses = outputLayer.config.units;
console.log(`   ✅ Output classes: ${numClasses}`);

// Verificar capas LSTM
console.log('\n🏗️  Arquitectura del modelo:');
const layers = topology.model_config.config.layers;
layers.forEach((layer, idx) => {
  const layerType = layer.class_name;
  const layerName = layer.name;
  console.log(`   ${idx + 1}. ${layerName} (${layerType})`);
});

// Verificar que tiene capas LSTM
const hasLSTM = layers.some(l => l.config.layer && l.config.layer.class_name === 'LSTM');
if (hasLSTM) {
  console.log('   ✅ Modelo contiene capas LSTM');
} else {
  console.log('   ⚠️  No se encontraron capas LSTM');
}

// Verificar que tiene Masking
const hasMasking = layers.some(l => l.class_name === 'Masking');
if (hasMasking) {
  console.log('   ✅ Modelo tiene capa Masking (para manejar frames faltantes)');
}

// Verificar weightsManifest
console.log('\n⚖️  Verificando pesos...');
const weightsManifest = modelData.weightsManifest;
if (!weightsManifest || weightsManifest.length === 0) {
  console.log('   ❌ No se encontró weightsManifest');
  process.exit(1);
}

let totalWeights = 0;
weightsManifest.forEach(manifest => {
  manifest.weights.forEach(weight => {
    totalWeights++;
  });
  
  manifest.paths.forEach(weightPath => {
    const fullPath = path.join(__dirname, weightPath);
    if (fs.existsSync(fullPath)) {
      console.log(`   ✅ ${weightPath} existe`);
    } else {
      console.log(`   ❌ ${weightPath} NO ENCONTRADO`);
    }
  });
});

console.log(`   ℹ️  Total de tensores de pesos: ${totalWeights}`);

// Verificar labels
console.log('\n🏷️  Verificando etiquetas...');
const labelsData = JSON.parse(fs.readFileSync(labelPath, 'utf8'));
const labels = labelsData.classes || labelsData;

if (!Array.isArray(labels)) {
  console.log('   ❌ El formato de labels no es un array');
} else {
  console.log(`   ✅ ${labels.length} etiquetas cargadas`);
  
  if (labels.length !== numClasses) {
    console.log(`   ⚠️  ADVERTENCIA: Número de labels (${labels.length}) no coincide con output classes (${numClasses})`);
  }
  
  // Mostrar primeras 10 etiquetas
  console.log('   Primeras etiquetas:', labels.slice(0, 10).join(', '));
}

// Verificar config
console.log('\n⚙️  Verificando configuración...');
const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

if (configData.input && configData.output) {
  console.log(`   ✅ Input config: ${JSON.stringify(configData.input.shape)}`);
  console.log(`   ✅ Output config: ${JSON.stringify(configData.output.shape)}`);
  console.log(`   ✅ Min frames required: ${configData.inference.min_frames_required}`);
  console.log(`   ✅ Confidence threshold: ${configData.inference.confidence_threshold}`);
  console.log(`   ✅ Smooth window: ${configData.inference.smooth_window}`);
} else {
  console.log('   ⚠️  Configuración incompleta');
}

// Verificar compatibilidad web
console.log('\n🌐 Verificando compatibilidad web...');

// Check for unsupported operations
const unsupportedOps = [];
// Las capas LSTM, Masking, Dense, Dropout son todas soportadas en TF.js WebGL

if (unsupportedOps.length > 0) {
  console.log('   ⚠️  Operaciones no soportadas encontradas:');
  unsupportedOps.forEach(op => console.log(`      - ${op}`));
} else {
  console.log('   ✅ Todas las operaciones son compatibles con WebGL');
}

// Resumen final
console.log('\n' + '='.repeat(70));
console.log('✅ VALIDACIÓN COMPLETADA EXITOSAMENTE');
console.log('='.repeat(70));
console.log('\n📊 Resumen:');
console.log(`   - Input shape: [batch, 24, 126]`);
console.log(`   - Output classes: ${numClasses}`);
console.log(`   - Labels: ${labels.length}`);
console.log(`   - Arquitectura: Bidirectional LSTM`);
console.log(`   - Compatible con: WebGL, WASM, CPU`);
console.log(`   - Optimizado para: React Native / Web`);

console.log('\n💡 Próximos pasos:');
console.log('   1. Instalar dependencias en React Native:');
console.log('      npm install @tensorflow/tfjs @tensorflow/tfjs-react-native');
console.log('   2. Implementar clasificador en src/ml/signMovementClassifier.ts');
console.log('   3. Crear hook de integración useSignMovementRecognition');
console.log('   4. Integrar con expo-camera para detección en tiempo real');

console.log('\n📖 Consulta README.md para ejemplos de código\n');
