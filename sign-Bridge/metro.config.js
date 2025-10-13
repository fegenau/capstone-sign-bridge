const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for TensorFlow.js model files (.bin files)
config.resolver.assetExts.push(
  'bin',      // TensorFlow.js weight files
  'tflite'    // TensorFlow Lite models
);

// Keep json in sourceExts (for imports) - it's there by default
// Don't add json to assetExts to avoid conflicts

// Configure public folder for web static files
config.watchFolders = [
  path.resolve(__dirname, 'public')
];

module.exports = config;
