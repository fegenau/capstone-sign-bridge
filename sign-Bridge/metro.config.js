// metro.config.js
// Permitir que Metro trate archivos .tflite, .bin, .json como assets

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Agregar extensiones de assets para TensorFlow.js
config.resolver.assetExts = config.resolver.assetExts || [];
const assetExtensions = ['tflite', 'bin'];
assetExtensions.forEach(ext => {
  if (!config.resolver.assetExts.includes(ext)) {
    config.resolver.assetExts.push(ext);
  }
});

// Configurar servidor web para servir assets/ml directamente
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Servir archivos de modelo ML estáticamente en web
    if (req.url.startsWith('/assets/ml/')) {
      const filePath = path.join(__dirname, req.url);
      const fs = require('fs');
      try {
        const data = fs.readFileSync(filePath);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(data);
        return;
      } catch (e) {
        // Continuar al siguiente middleware si falla
      }
    }
    return middleware(req, res, next);
  };
};

module.exports = config;
