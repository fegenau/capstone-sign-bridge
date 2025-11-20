# 🔥 FIREBASE DEPLOYMENT GUIDE

## ✅ STATUS
- ✅ App compilada (dist/ listo)
- ✅ firebase.json configurado
- ⏳ Necesita autenticación con Google

---

## 🔐 PASO 1: Autenticarse con Firebase

**Opción A: Login interactivo (Recomendado)**

Ejecuta en tu terminal:
```bash
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\SB_v4
firebase login
```

Esto abrirá tu navegador:
1. Selecciona tu cuenta Google: **seba.medinam@duocuc.cl**
2. Presiona "Permitir" para que Firebase CLI acceda a tus datos
3. Verás un mensaje de confirmación
4. Regresa a la terminal

---

## 🎯 PASO 2: Seleccionar Proyecto Firebase

Ejecuta:
```bash
firebase use --add
```

Esto te pedirá:
1. Ingresa el ID del proyecto Firebase (o selecciona de la lista)
2. Dale un alias (ej: "default" o "capstone")
3. Presiona Enter

---

## 🚀 PASO 3: Deploy a Firebase Hosting

Ejecuta:
```bash
firebase deploy --only hosting
```

Espera a que termine. Verás:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/[PROJECT_ID]/overview
Hosting URL: https://[PROJECT_NAME].web.app
```

**¡Copia ese URL!** Es tu app en vivo.

---

## 📋 RESUMEN DE COMANDOS

```bash
# 1. Navega a la carpeta del proyecto
cd C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\SB_v4

# 2. Autentica con Google
firebase login

# 3. Selecciona tu proyecto
firebase use --add

# 4. Deploy
firebase deploy --only hosting

# 5. (Opcional) Ver proyecto en consola
firebase open hosting:site
```

---

## ✨ RESULTADO ESPERADO

Después del deploy tendrás:
- URL de Firebase Hosting: `https://[tu-proyecto].web.app`
- App completamente funcional en la nube
- Todos los 7 tabs accesibles
- TensorFlow model cargando
- MediaPipe WASM funcionando

---

## 🎓 FIREBASE vs NETLIFY

| Criterio | Firebase | Netlify Drop |
|----------|----------|--------------|
| Autenticación | Sí (Google) | No |
| CLI | Sí | No |
| Facilidad | Media | Muy fácil |
| Velocidad | Rápido | Más rápido |
| CDN | Global | Global |
| SSL | Incluido | Incluido |

**Ambas opciones funcionan perfectamente.**

---

## 🆘 TROUBLESHOOTING

### Problema: "Failed to authenticate"
**Solución:** Ejecuta `firebase login` nuevamente

### Problema: "No project selected"
**Solución:** Ejecuta `firebase use --add` para seleccionar proyecto

### Problema: "Cannot find firebase.json"
**Solución:** Asegúrate de estar en: `C:\Users\SEED\Documents\GitHub\capstone-sign-bridge\SB_v4`

### Problema: Deploy no completa
**Solución:**
1. Asegúrate que dist/ existe: `ls dist/`
2. Verifica que dist/ tiene contenido: `ls -la dist/`
3. Intenta nuevamente: `firebase deploy --only hosting`

---

## 📱 DESPUÉS DEL DEPLOY

1. Abre la URL de Firebase Hosting en tu navegador
2. Verifica que todos los 7 tabs funcionen
3. Prueba los nuevos componentes (Learn, Videos, Challenges)
4. Guarda el URL para tu presentación

---

## 💡 NOTAS

- Firebase Hosting es gratuito para las primeras 10 GB/mes
- Tu app de 3.2 MB es muy pequeña, sin problemas
- El dominio `.web.app` es oficial de Google
- Puedes agregar un dominio personalizado después si quieres

**¿Listo para hacer el deploy? Ejecuta los comandos en orden! 🚀**
