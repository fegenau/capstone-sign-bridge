const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Agregar extensiones de assets para TFLite y ONNX
config.resolver.assetExts.push(
  'tflite',
  'onnx',
  'pb',
  'pbtxt',
  'mlmodel'
);

module.exports = config;
