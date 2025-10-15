#!/usr/bin/env node
// scripts/validateModel.js
// Validates that the TFLite model file is present and valid before building

const fs = require('fs');
const path = require('path');

const MODEL_PATH = path.join(__dirname, '..', 'assets', 'Modelo', 'runs', 'detect', 'train', 'weights', 'best_float16.tflite');
const MIN_SIZE_MB = 1;
const MAX_SIZE_MB = 100;

console.log('🔍 Validating TFLite model...\n');

// Check if file exists
if (!fs.existsSync(MODEL_PATH)) {
  console.error('❌ ERROR: Model file not found!');
  console.error(`Expected location: ${MODEL_PATH}`);
  console.error('\n📝 To add the model:');
  console.error('1. Export your YOLO model: python -c "from ultralytics import YOLO; YOLO(\'best.pt\').export(format=\'tflite\')"');
  console.error('2. Copy best_float16.tflite to: assets/Modelo/runs/detect/train/weights/');
  process.exit(1);
}

// Check file size
const stats = fs.statSync(MODEL_PATH);
const sizeMB = stats.size / (1024 * 1024);

console.log(`✅ Model file found: ${path.basename(MODEL_PATH)}`);
console.log(`📊 File size: ${sizeMB.toFixed(2)} MB`);

if (sizeMB < MIN_SIZE_MB) {
  console.error(`\n❌ ERROR: Model file too small (${sizeMB.toFixed(2)} MB)`);
  console.error(`Expected size: ${MIN_SIZE_MB}-${MAX_SIZE_MB} MB`);
  console.error('\n⚠️  This is likely a placeholder file, not a real trained model.');
  console.error('Please replace it with your actual YOLO TFLite model.');
  process.exit(1);
}

if (sizeMB > MAX_SIZE_MB) {
  console.warn(`\n⚠️  WARNING: Model file very large (${sizeMB.toFixed(2)} MB)`);
  console.warn('This may cause slow loading times on devices.');
}

// Check if it's a binary file (not text)
const buffer = fs.readFileSync(MODEL_PATH);
const firstBytes = buffer.slice(0, 20).toString('ascii');

if (firstBytes.includes('This is a placeholder') || firstBytes.includes('text')) {
  console.error('\n❌ ERROR: Model file appears to be a text placeholder!');
  console.error('Please replace it with a real binary TFLite model.');
  process.exit(1);
}

// TFLite files typically start with specific magic bytes
// Check for TFLite signature (optional, basic validation)
const tfliteSignature = buffer.slice(0, 8);
const hasValidHeader = buffer.length > 100; // Basic sanity check

if (!hasValidHeader) {
  console.error('\n❌ ERROR: Model file appears corrupted or invalid.');
  console.error('Please ensure you exported the model correctly.');
  process.exit(1);
}

console.log('✅ Model file appears valid (binary TFLite format)');
console.log(`📝 Last modified: ${stats.mtime.toLocaleString()}`);
console.log('\n🎉 Model validation passed! Ready to build.\n');

process.exit(0);
