const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for binary files (.bin) used by TensorFlow models
config.resolver.assetExts.push(
  'bin',
  'tflite'
);

// Ensure source extensions are properly configured
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx', 'json'];

module.exports = config;
