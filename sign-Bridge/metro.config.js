// metro.config.js
// Permitir que Metro trate archivos .tflite como assets

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = config.resolver.assetExts || [];
if (!config.resolver.assetExts.includes('tflite')) {
  config.resolver.assetExts.push('tflite');
}

module.exports = config;
