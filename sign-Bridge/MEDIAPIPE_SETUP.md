# 🚀 Setup Rápido - MediaPipe en SignBridge

**Tiempo estimado:** 5 minutos
**Requisitos:** npm, node, Expo running

---

## ✅ Paso 1: Instalar MediaPipe

```bash
npm install @mediapipe/tasks-vision
```

**Verifica:**
```bash
npm list @mediapipe/tasks-vision
# Debería mostrar la versión instalada
```

---

## ✅ Paso 2: Verificar Archivos

Asegúrate que existen:

```
sign-Bridge/
├── hooks/
│   └── useMediaPipeDetection.js     ✅ DEBE EXISTIR
├── screens/
│   └── WordDetectionScreen.mediapipe.js  ✅ DEBE EXISTIR
└── MEDIAPIPE_INTEGRATION.md          ✅ DEBE EXISTIR
```

**Si falta alguno, contactar developer.**

---

## ✅ Paso 3: Actualizar App.js

**Encuentra esta línea:**

```javascript
import WordDetectionScreen from './screens/WordDetectionScreen';
```

**Cambia a:**

```javascript
import WordDetectionScreen from './screens/WordDetectionScreen.mediapipe';
```

**Guarda el archivo.**

---

## ✅ Paso 4: Recargar Servidor

En la terminal donde corre `npm start`:

```
Presiona: r
```

O reinicia:

```bash
Ctrl+C
npm start
```

---

## ✅ Paso 5: Abrir en Navegador

```
http://localhost:3000
```

---

## ✅ Paso 6: Probar

1. **Navega a:** Home → WordDetectionScreen
2. **Abre consola:** F12
3. **Verifica:**
   - ✓ Sin errores rojos
   - ✓ Consola muestra "MediaPipe inicializado"

---

## ✅ Paso 7: Permitir Cámara

Cuando aparezca, **permite acceso a cámara**:
- Chrome/Firefox: "Permitir" en banner
- Safari: Ir a Preferencias

---

## ✅ Paso 8: Usar

1. **Click en botón Play (▶️)**
2. **Muestra tu mano hacia la cámara**
3. **Espera a que se llene el buffer (24 frames)**
4. **Verifica:**
   - ✓ Video visible
   - ✓ Badge "🖐️ Detectando manos..."
   - ✓ Resultado en DetectionOverlay

---

## 🐛 Si Algo Falla

### Error: "MediaPipe Vision no disponible"

```bash
# Instalar nuevamente
npm install @mediapipe/tasks-vision

# Limpiar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Video no aparece

1. Verifica permisos de cámara en navegador
2. Abre consola (F12)
3. Busca errores

### Mano no se detecta

1. Mejora iluminación
2. Coloca mano en el centro
3. Acercate/aleja hasta encontrar distancia óptima

### Bajo FPS

1. Cierra otras pestañas
2. Reduce carga del navegador
3. En hook: cambiar TARGET_FPS a 15

---

## 📊 Verificar Status

En la consola del navegador (F12 → Console):

```javascript
// Debería ver logs de:
console.log('MediaPipe inicializado')
console.log('Manos detectadas: left=true right=false')
console.log('Detección TensorFlow: Hola (0.87)')
```

---

## 🎯 Flujo Esperado

```
1. App carga → MediaPipe se inicializa
2. Usuario da permiso de cámara
3. Usuario hace click en Play
4. Camera stream comienza
5. MediaPipe detecta manos
6. Buffer se llena con 24 frames
7. TensorFlow.js predice gesto
8. DetectionOverlay muestra resultado
9. Usuario puede confirmar o reintentar
```

---

## 📱 En Móvil (iOS/Android)

**Actualmente:** ⏳ No completamente soportado

**Para habilitar:**
1. Reemplazar `<video>` con `<Camera>` de expo
2. Usar MediaPipe iOS/Android SDKs
3. Configurar build nativo con EAS

**Recomendación:** Usar para web primero, luego expandir a móvil.

---

## 🎨 Alternativas

### Si quieres usar la pantalla original sin MediaPipe:

```javascript
// En App.js, vuelve a:
import WordDetectionScreen from './screens/WordDetectionScreen';

// Ahora usa simulación (sin cámara)
```

### Si quieres agregar MediaPipe a otra pantalla:

1. Copiar hook `useMediaPipeDetection.js`
2. Usarlo en tu componente
3. Seguir patrón en `WordDetectionScreen.mediapipe.js`

---

## ✅ Checklist Final

- [ ] Instalé `@mediapipe/tasks-vision`
- [ ] Cambié import en App.js
- [ ] Recargué servidor (r)
- [ ] Abrí http://localhost:3000
- [ ] Permití acceso a cámara
- [ ] Vi video en tiempo real
- [ ] Hice gesto con mano
- [ ] Vi resultado en pantalla
- [ ] Probé múltiples gestos
- [ ] Medir performance (F12 → Performance)

---

## 🚀 ¡Listo!

MediaPipe está instalado y funcionando. Ahora puedes:

1. **Entrenar el modelo** con más gestos
2. **Mejorar la UI** con más features
3. **Expandir a iOS/Android** con native SDKs
4. **Publicar** la app

---

## 📞 Soporte

**Problema:** MediaPipe no inicializa
**Solución:** Ver MEDIAPIPE_INTEGRATION.md → Troubleshooting

**Problema:** Baja performance
**Solución:** Ver MEDIAPIPE_INTEGRATION.md → Performance

**Problema:** Quiero más detalles
**Solución:** Leer MEDIAPIPE_INTEGRATION.md (documentación completa)

---

**Tiempo total:** ~5 minutos
**Dificultad:** 🟢 Muy Fácil
**Soporte:** Completo en MEDIAPIPE_INTEGRATION.md
