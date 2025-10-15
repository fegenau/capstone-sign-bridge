# 🚀 Guía Rápida: EAS Build (Expo Cloud)

## 📋 Prerequisitos

1. **Instalar EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Login en Expo**:
   ```bash
   eas login
   ```
   (Usa tu cuenta de Expo o crea una en https://expo.dev)

---

## 🔨 Comandos para generar APK

### Opción 1: Build Preview (Recomendado para testing)
```bash
cd sign-Bridge
eas build --platform android --profile preview-debug
```

**Ventajas:**
- ✅ Incluye modelo TFLite automáticamente
- ✅ APK Debug con DevTools habilitado
- ✅ Más rápido que production
- ✅ No requiere configuración de keystore

---

### Opción 2: Build Production
```bash
cd sign-Bridge
eas build --platform android --profile production
```

**Ventajas:**
- ✅ APK optimizado (Release mode)
- ✅ Mejor performance
- ⚠️ Requiere configurar keystore para firma

---

### Opción 3: Development (con Dev Client)
```bash
cd sign-Bridge
eas build --platform android --profile development
```

**Nota:** Este genera el mismo tipo de APK que tenemos actualmente (con Dev Launcher)

---

## 📊 Monitorear el Build

Después de ejecutar el comando:

1. Se abrirá automáticamente una página en tu navegador: `https://expo.dev/accounts/[tu-usuario]/projects/signbridge/builds`
2. También puedes ver el progreso en terminal
3. El build toma ~15-20 minutos
4. Al finalizar, recibirás un link de descarga directo del APK

---

## 📥 Descargar el APK

Una vez completado:

1. **Opción A (Navegador):** Click en "Download" en la página del build
2. **Opción B (CLI):** EAS CLI te mostrará el link de descarga directamente
3. **Opción C (QR):** Escanea el QR para instalar directamente en tu dispositivo

---

## 🔍 Verificar contenido del APK

El script `eas-build-post-install.js` se ejecuta automáticamente y copia el modelo:

```
✅ Modelo fuente encontrado: 5.96 MB
📁 Creando directorio de assets
📋 Copiando modelo a Android assets...
✅ Modelo copiado exitosamente: 5.96 MB
📍 Ubicación: android/app/src/main/assets/Modelo/best_float16.tflite
🎉 Post-install hook completado exitosamente
```

Verás estos logs en la consola de EAS durante el build.

---

## 🎯 Perfil Recomendado

Para tu caso (testing con modelo nativo), usa:

```bash
eas build --platform android --profile preview-debug
```

Este perfil:
- ✅ Genera APK (no AAB)
- ✅ Modo Debug (más logs)
- ✅ Incluye modelo TFLite
- ✅ No requiere Play Store
- ✅ Instalable directamente con `adb install`

---

## 🆚 EAS Build vs GitHub Actions

| Característica | EAS Build | GitHub Actions |
|----------------|-----------|----------------|
| Optimización Expo | ✅ Nativa | ⚠️ Manual |
| Tiempo de build | ~15-20 min | ~20-25 min |
| Configuración | ⚡ Mínima | 🔧 Manual |
| Caching | ✅ Automático | ⚠️ Limitado |
| Debugging | ✅ Logs detallados | ⚠️ Básico |
| Costo | 🆓 Gratis (tier) | 🆓 Gratis |

---

## 📝 Notas Importantes

1. **Primera vez:** EAS Build puede pedir configurar `app.json` extra (slug, owner, etc.)
2. **Límite gratuito:** Expo ofrece builds gratuitos limitados/mes (consulta tu plan)
3. **Credenciales:** EAS maneja automáticamente las credenciales de Android
4. **Model path:** El modelo se carga desde `Modelo/best_float16.tflite` (Android assets)

---

## 🐛 Troubleshooting

### Error: "Project not configured"
```bash
cd sign-Bridge
eas build:configure
```

### Error: "Not logged in"
```bash
eas login
eas whoami  # Verificar login
```

### Error: "Model not found in build"
Verifica que el script post-install se ejecutó:
- Busca en logs de EAS: "Post-install hook ejecutándose"
- El modelo debe aparecer en `android/app/src/main/assets/Modelo/`

---

## 🎉 Siguiente Paso

Una vez descargado el APK de EAS:

```bash
# Instalar
adb install -r app-preview-debug.apk

# Lanzar
adb shell am start -n com.anonymous.signbridge/.MainActivity

# Monitorear logs
adb logcat -s ReactNativeJS:V TFLite:V
```

Busca en logs:
- ✅ `"Modelo cargado directamente desde Android assets"`
- ✅ `"✅ Modelo TFLite cargado exitosamente"`
- ✅ `"🎯 Modo: Modelo TFLite"`
