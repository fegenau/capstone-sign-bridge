const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const config = getDefaultConfig(__dirname);

// En desarrollo web, Expo sirve archivos estáticos desde public/
// configurando extraNodeModules y watchFolders
config.watchFolders = [path.join(__dirname, 'public')];
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'json'],
};

module.exports = config;
