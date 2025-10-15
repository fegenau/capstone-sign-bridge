# 🔍 DIAGNÓSTICO DE ERROR DE BUILD

## ❌ Build Falló

Por favor, proporciona la siguiente información para diagnosticar:

### 1. **¿En qué paso falló?**
   - [ ] Checkout code
   - [ ] Setup Node.js
   - [ ] Setup Java
   - [ ] Setup Android SDK
   - [ ] npm install
   - [ ] expo prebuild
   - [ ] gradlew assembleRelease
   - [ ] Upload artifact
   - [ ] Create GitHub Release

### 2. **Errores Comunes y Soluciones:**

#### **Error: npm install timeout**
```
Solución: Re-run workflow (timeout de GitHub)
```

#### **Error: expo prebuild failed**
```
Posible causa: Dependencias incompatibles
Solución: Verificar package.json
```

#### **Error: Gradle build failed**
```
Posibles causas:
- Out of memory (común en GitHub Actions)
- NDK no disponible
- Dependencias nativas fallaron

Solución: 
1. Re-run workflow (puede ser temporal)
2. Ajustar Gradle settings
```

#### **Error: Upload artifact failed**
```
Posible causa: APK muy grande (>2GB)
Solución: Ya configurado GitHub Release como alternativa
```

---

## 🔧 SOLUCIONES RÁPIDAS:

### **Solución 1: Re-run Workflow (90% de casos)**

Muchos errores son temporales (timeout, memoria). Simplemente:

1. Ve a: https://github.com/fegenau/capstone-sign-bridge/actions
2. Clic en el workflow fallido
3. Botón "Re-run all jobs"

---

### **Solución 2: Ajustar Gradle Memory**

Si falla por memoria, agregar en `android/gradle.properties`:

```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
org.gradle.daemon=false
```

---

### **Solución 3: Compilación Local Alternativa**

Si GitHub Actions sigue fallando, podemos usar **EAS Build** (cloud de Expo):

```powershell
cd sign-Bridge
npx eas login
npx eas build --platform android --profile preview
```

---

## 📋 INFORMACIÓN NECESARIA:

Para ayudarte mejor, por favor copia y pega:

1. **Mensaje de error exacto** del paso que falló
2. **Log completo** de ese paso (si es posible)
3. **Tiempo en que falló** (para ver si fue timeout)

---

## 🚀 PRÓXIMOS PASOS:

Dependiendo del error, puedo:
1. Ajustar el workflow
2. Modificar configuración de Gradle
3. Usar EAS Build como alternativa
4. Compilar localmente si es urgente

**¿Qué error específico muestra GitHub Actions?**
