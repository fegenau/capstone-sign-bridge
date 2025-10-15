#!/usr/bin/env node

/**
 * Script de verificación del modelo TFLite
 * 
 * Este script verifica que:
 * 1. Las dependencias necesarias están instaladas
 * 2. El archivo del modelo existe
 * 3. Los paths son correctos
 * 
 * Uso: node verify-model.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del modelo TFLite...\n');

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const success = (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`);
const error = (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`);
const warning = (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`);
const info = (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`);

let issuesFound = 0;

// 1. Verificar package.json
console.log('📦 Verificando package.json...');
try {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  // Verificar react-native-fast-tflite
  if (packageJson.dependencies['react-native-fast-tflite']) {
    const version = packageJson.dependencies['react-native-fast-tflite'];
    success(`react-native-fast-tflite declarado: ${version}`);
  } else {
    error('react-native-fast-tflite NO está en package.json');
    issuesFound++;
  }
  
  // Verificar expo-asset
  if (packageJson.dependencies['expo-asset']) {
    success('expo-asset declarado');
  } else {
    error('expo-asset NO está en package.json');
    issuesFound++;
  }
  
  // Verificar expo-file-system
  if (packageJson.dependencies['expo-file-system']) {
    success('expo-file-system declarado');
  } else {
    error('expo-file-system NO está en package.json');
    issuesFound++;
  }
} catch (err) {
  error(`No se pudo leer package.json: ${err.message}`);
  issuesFound++;
}

console.log();

// 2. Verificar node_modules
console.log('📂 Verificando node_modules...');
try {
  const tflitePath = path.join(__dirname, 'node_modules', 'react-native-fast-tflite');
  if (fs.existsSync(tflitePath)) {
    success('react-native-fast-tflite instalado en node_modules');
    
    // Verificar package.json del módulo
    const tflitePackagePath = path.join(tflitePath, 'package.json');
    if (fs.existsSync(tflitePackagePath)) {
      const tflitePackage = JSON.parse(fs.readFileSync(tflitePackagePath, 'utf8'));
      info(`Versión instalada: ${tflitePackage.version}`);
    }
  } else {
    error('react-native-fast-tflite NO está en node_modules');
    warning('Ejecuta: npm install --legacy-peer-deps');
    issuesFound++;
  }
} catch (err) {
  error(`Error verificando node_modules: ${err.message}`);
  issuesFound++;
}

console.log();

// 3. Verificar archivo del modelo
console.log('🧠 Verificando archivo del modelo...');
const modelPaths = [
  path.join(__dirname, 'assets', 'Modelo', 'best_float16.tflite'),
  path.join(__dirname, 'assets', 'Modelo', 'runs', 'detect', 'train', 'weights', 'best_float16.tflite'),
];

let modelFound = false;
for (const modelPath of modelPaths) {
  if (fs.existsSync(modelPath)) {
    const stats = fs.statSync(modelPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    success(`Modelo encontrado: ${path.relative(__dirname, modelPath)}`);
    info(`Tamaño: ${sizeMB} MB`);
    modelFound = true;
    break;
  }
}

if (!modelFound) {
  error('Modelo NO encontrado en ninguna ubicación esperada');
  warning('Ubicaciones buscadas:');
  modelPaths.forEach(p => warning(`  - ${path.relative(__dirname, p)}`));
  issuesFound++;
}

console.log();

// 4. Verificar app.json
console.log('⚙️  Verificando app.json...');
try {
  const appJsonPath = path.join(__dirname, 'app.json');
  if (fs.existsSync(appJsonPath)) {
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    // Verificar plugins
    if (appJson.expo && appJson.expo.plugins) {
      const plugins = appJson.expo.plugins;
      
      // Buscar expo-build-properties
      const hasBuildProperties = plugins.some(p => 
        (typeof p === 'string' && p === 'expo-build-properties') ||
        (Array.isArray(p) && p[0] === 'expo-build-properties')
      );
      
      if (hasBuildProperties) {
        success('expo-build-properties configurado en plugins');
      } else {
        warning('expo-build-properties NO está en plugins');
        info('Esto es necesario para compilación nativa');
      }
      
      // Buscar expo-camera
      const hasCamera = plugins.some(p => 
        (typeof p === 'string' && p === 'expo-camera') ||
        (Array.isArray(p) && p[0] === 'expo-camera')
      );
      
      if (hasCamera) {
        success('expo-camera configurado en plugins');
      } else {
        warning('expo-camera NO está en plugins');
      }
    } else {
      warning('No se encontraron plugins en app.json');
    }
  } else {
    error('app.json no encontrado');
    issuesFound++;
  }
} catch (err) {
  error(`Error verificando app.json: ${err.message}`);
  issuesFound++;
}

console.log();

// 5. Verificar detectionService.js
console.log('🔧 Verificando detectionService.js...');
try {
  const servicePath = path.join(__dirname, 'utils', 'services', 'detectionService.js');
  if (fs.existsSync(servicePath)) {
    const serviceContent = fs.readFileSync(servicePath, 'utf8');
    
    // Verificar imports
    if (serviceContent.includes("import { TensorflowModel } from 'react-native-fast-tflite'")) {
      success('Import de TensorflowModel encontrado');
    } else {
      error('Import de TensorflowModel NO encontrado');
      issuesFound++;
    }
    
    // Verificar loadModel function
    if (serviceContent.includes('async loadModel()')) {
      success('Función loadModel() encontrada');
    } else {
      error('Función loadModel() NO encontrada');
      issuesFound++;
    }
    
    // Verificar require del modelo
    if (serviceContent.includes("require('../../assets/Modelo/best_float16.tflite')")) {
      success('Require del modelo encontrado');
    } else {
      warning('Require del modelo no encontrado o ruta diferente');
    }
  } else {
    error('detectionService.js no encontrado');
    issuesFound++;
  }
} catch (err) {
  error(`Error verificando detectionService.js: ${err.message}`);
  issuesFound++;
}

console.log();

// Resumen final
console.log('═'.repeat(60));
if (issuesFound === 0) {
  console.log(colors.green);
  console.log('🎉 ¡TODO CONFIGURADO CORRECTAMENTE!');
  console.log(colors.reset);
  console.log();
  console.log('Próximos pasos:');
  console.log('  1. Modo desarrollo (Expo Go):');
  console.log('     npx expo start');
  console.log('     (Usará modo simulación)');
  console.log();
  console.log('  2. Modo producción (Compilación nativa):');
  console.log('     npx expo prebuild --platform android');
  console.log('     npx expo run:android');
  console.log('     (Usará modelo TFLite real)');
} else {
  console.log(colors.red);
  console.log(`❌ SE ENCONTRARON ${issuesFound} PROBLEMA(S)`);
  console.log(colors.reset);
  console.log();
  console.log('Revisa los errores arriba y corrígelos.');
  console.log('Para ayuda, consulta: MODEL_LOADING_GUIDE.md');
}
console.log('═'.repeat(60));
console.log();

// Exit code
process.exit(issuesFound > 0 ? 1 : 0);
