// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Añadir soporte para archivos de modelo TensorFlow.js
config.resolver.assetExts.push('json', 'bin', 'pb');

module.exports = config;