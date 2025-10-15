# SignBridge 👐

<p align="center">
  <img src="./asset/signbridge-logo" alt="SignBridge Logo" width="150" height="150">
</p>

<h1 align="center">SignBridge</h1>
<p align="center">
  <em>Creando puentes de comunicación entre personas sordas y oyentes</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-en%20desarrollo-yellow?style=for-the-badge">
  <img src="https://github.com/fegenau/capstone-sign-bridge/workflows/CI%2FCD%20Pipeline/badge.svg">
  <img src="https://img.shields.io/badge/tests-19%20passing-brightgreen?style=for-the-badge">
  <img src="https://img.shields.io/badge/coverage-17.61%25-orange?style=for-the-badge">
  <img src="https://img.shields.io/github/license/fegenau/capstone-sign-bridge?style=for-the-badge">
</p>

---

## 📖 Descripción

**SignBridge** es una **aplicación móvil** desarrollada para **personas sordomudas**, enfocada en **reconocer el alfabeto, números y gestos** de la Lengua de Señas Chilena mediante **visión por computadora** e **inteligencia artificial**.

El objetivo principal es **romper las barreras de comunicación** y **generar inclusión social**, creando un **puente** entre personas sordas y oyentes.

---

## ✨ Características principales

- 🖐️ **Reconocimiento de alfabeto** — Identificación de letras (A-Z) mediante IA
- 🔢 **Detección de números** — Traducción automática de números (0-9) a texto
- 👐 **Modo dual inteligente** — TFLite + Simulación automática de fallback
- 🎙️ **Detección en tiempo real** — Procesamiento continuo con debounce de 1.5s
- 📱 **Diseño optimizado** — Interfaz accesible, intuitiva y rápida
- 🔄 **Reintentos automáticos** — Carga de modelo cada 10 segundos

---

## 🛠️ Tecnologías Utilizadas

| Tecnología            | Uso Principal                     |
|----------------------|----------------------------------|
| **React Native + Expo** | Frontend multiplataforma |
| **YOLO TFLite**      | Modelo de detección de gestos |
| **Expo Camera**      | Captura de video en tiempo real |
| **Jest**             | Testing y validación automática |
| **GitHub Actions**   | CI/CD pipeline automatizado |

---

## 🚀 Inicio Rápido

### Instalación
```bash
# Clonar repositorio
git clone https://github.com/fegenau/capstone-sign-bridge.git

# Ingresar al proyecto
cd capstone-sign-bridge/sign-Bridge

# Instalar dependencias
npm install

# Iniciar la aplicación
npm start
```

### Probar la aplicación
1. Escanea el código QR con **Expo Go** en tu teléfono
2. Permite permisos de cámara
3. Muestra tu mano con una seña del alfabeto o número
4. Observa la detección en tiempo real

---

## 🧪 Testing & CI/CD

### ✅ Estado de Tests
```
Test Suites: 3 passed, 3 total
Tests:       19 passed, 19 total
Coverage:    17.61% lines, 37.63% on detectionService
```

### Ejecutar Tests
```bash
cd sign-Bridge
npm test                    # Ejecutar todos los tests
npm test -- --coverage      # Con reporte de cobertura
npm test -- --watch         # Modo watch
```

### Pipeline CI/CD
El proyecto incluye un pipeline completo de GitHub Actions:
- ✅ Lint y calidad de código
- ✅ Tests unitarios e integración
- ✅ Builds de Android e iOS
- ✅ Auditoría de seguridad
- ✅ Deploy a Expo (rama main)

Ver documentación completa en [`TESTING.md`](./TESTING.md)

---

## 📐 Arquitectura del Proyecto

```
sign-Bridge/
├── screens/              # Pantallas principales
│   ├── SplashScreen.js
│   ├── HomeScreen.js
│   ├── AlphabetDetectionScreen.js
│   └── SettingsScreen.js
├── components/           # Componentes reutilizables
│   ├── camera/
│   │   └── DetectionOverlay.js
│   └── common/
│       └── AlphabetGrid.js
├── utils/
│   ├── services/
│   │   └── detectionService.js  # ⚡ Singleton de detección
│   └── constants/
│       ├── alphabet.js
│       └── navigation.js
└── __tests__/            # Tests automatizados
    ├── detectionService.test.js
    ├── constants.test.js
    └── App.test.js
```

### Sistema de Detección (Singleton)
```javascript
// Patrón crítico - SIEMPRE usar la instancia exportada
import { detectionService } from './utils/services/detectionService';

// Configuración
const DETECTION_CONFIG = {
  minConfidence: 0.7,        // 70% umbral de confianza
  detectionInterval: 1500,   // 1.5s debounce
  modelRetryInterval: 10000  // Reintentar cada 10s
};
```

---

## 📚 Documentación

### Guías Principales
- 📘 [**ARCHITECTURE.md**](./sign-Bridge/ARCHITECTURE.md) - Arquitectura del sistema
- 📗 [**MODEL_INTEGRATION.md**](./sign-Bridge/MODEL_INTEGRATION.md) - Integración del modelo TFLite
- 📙 [**TESTING.md**](./TESTING.md) - Guía completa de testing
- 📕 [**CI_CD_STATUS.md**](./CI_CD_STATUS.md) - Estado del pipeline CI/CD
- 📔 [**QUICK_START.md**](./sign-Bridge/QUICK_START.md) - Inicio rápido (3 pasos)

### Guías Técnicas
- [BACKEND_API_GUIDE.md](./sign-Bridge/BACKEND_API_GUIDE.md) - Implementación de API Python/Flask
- [SETUP.md](./sign-Bridge/SETUP.md) - Instalación detallada
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Guía para AI agents

---

## 🔧 Desarrollo

### Convenciones de Código
- **Componentes**: Funcionales con hooks (useState, useEffect, useRef)
- **Servicios**: Clases singleton con callbacks
- **Constantes**: Uppercase con underscores (DETECTION_CONFIG)
- **Archivos**: camelCase para JS, PascalCase para componentes

### Tema Visual
- **Fondo**: `#000000` (negro)
- **Acento**: `#00FF88` (verde neón)
- **Letras**: `#4A4A4A` (gris)
- **Números**: `#4A90E2` (azul)

---

## 🗺️ Roadmap

### ✅ Completado
- [x] Reconocimiento de alfabeto (A-Z)
- [x] Detección de números (0-9)
- [x] Sistema de fallback con simulación
- [x] Reintentos automáticos de modelo
- [x] Pipeline CI/CD completo
- [x] Testing automatizado (19 tests)

### 🚧 En Desarrollo
- [ ] Integración completa de modelo TFLite
- [ ] Detección de frases básicas
- [ ] Modo offline optimizado

### 🔮 Futuro
- [ ] Reconocimiento de gestos complejos
- [ ] Traducción bidireccional (texto → señas)
- [ ] Modo multijugador para práctica
- [ ] Integración con backend Python/YOLO

---

## 👥 Equipo de Desarrollo

**Capstone Team**
- Francisco Egenau — Founder & Lead Developer
- Sebastián Medina — Machine Learning Engineer
- Matías Machuca — Mobile Developer

---

## 🤝 Contribuir

### Configurar Entorno de Desarrollo
1. Fork el repositorio
2. Clona tu fork: `git clone https://github.com/tu-usuario/capstone-sign-bridge.git`
3. Instala dependencias: `cd sign-Bridge && npm install`
4. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
5. Ejecuta tests: `npm test`
6. Commit y push: `git commit -am "Add: nueva funcionalidad" && git push`
7. Abre un Pull Request

### Requisitos para PR
- ✅ Todos los tests deben pasar
- ✅ Lint sin errores
- ✅ Coverage no debe disminuir
- ✅ Documentación actualizada

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](./LICENSE) para más información.

---

## 📞 Contacto

- **Email**: contacto@signbridge.cl
- **GitHub**: [fegenau/capstone-sign-bridge](https://github.com/fegenau/capstone-sign-bridge)
- **Issues**: [Reportar problema](https://github.com/fegenau/capstone-sign-bridge/issues)

---

<p align="center">
  💙 Hecho con dedicación para crear un mundo más inclusivo
</p>

<p align="center">
  <strong>SignBridge</strong> - Construyendo puentes de comunicación
</p>
