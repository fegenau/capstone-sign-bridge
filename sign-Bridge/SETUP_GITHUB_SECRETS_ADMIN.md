# 🔐 Configuración de GitHub Secrets - REQUIERE ACCESO DE ADMINISTRADOR

**NOTA:** Este archivo es para el administrador del repositorio (@fegenau)

## 🎯 Propósito

Configurar los secretos necesarios para que GitHub Actions pueda firmar automáticamente el APK de Android en modo release.

---

## 📋 Pasos para el Administrador

### 1. Acceder a la configuración de secretos

Ve a: **https://github.com/fegenau/capstone-sign-bridge/settings/secrets/actions**

*Nota: Solo usuarios con permisos de **Admin** o **Maintain** pueden acceder a esta página.*

---

### 2. Agregar los 4 secretos requeridos

Haz clic en **"New repository secret"** para cada uno de los siguientes:

#### Secret 1: ANDROID_KEYSTORE_BASE64

```
Name: ANDROID_KEYSTORE_BASE64
Value: [VER ARCHIVO keystore-base64.txt EN LA CARPETA sign-Bridge]
```

**Instrucciones:**
1. Abre el archivo `sign-Bridge/keystore-base64.txt`
2. Copia TODO el contenido (es una cadena Base64 larga, aproximadamente 2900 caracteres)
3. Pégalo en el campo "Value"
4. Click "Add secret"

---

#### Secret 2: ANDROID_KEYSTORE_PASSWORD

```
Name: ANDROID_KEYSTORE_PASSWORD
Value: 3b11cbf3cbe06cb9aadc36c9151147a0
```

---

#### Secret 3: ANDROID_KEY_ALIAS

```
Name: ANDROID_KEY_ALIAS
Value: 6455c3e66d4fe00c9ef22e1dc13b87f6
```

---

#### Secret 4: ANDROID_KEY_PASSWORD

```
Name: ANDROID_KEY_PASSWORD
Value: 0e102d10eb4d7068982f24d1ee6f3c29
```

---

## ✅ Verificación

Después de agregar los 4 secretos, deberías ver en:
https://github.com/fegenau/capstone-sign-bridge/settings/secrets/actions

```
✅ ANDROID_KEYSTORE_BASE64
✅ ANDROID_KEYSTORE_PASSWORD
✅ ANDROID_KEY_ALIAS
✅ ANDROID_KEY_PASSWORD
```

---

## 🚀 Siguiente Paso

Una vez configurados los secretos:

1. Hacer push de cualquier cambio al branch `feature/CSB-47/integrate-CNN-model-unreleased`
2. El workflow se ejecutará automáticamente
3. Esta vez generará `app-release.apk` (FIRMADO) en lugar de `app-debug.apk`

---

## 🔒 Seguridad

- ✅ Los secretos están encriptados en GitHub
- ✅ Los secretos NO aparecen en los logs del workflow
- ✅ Solo usuarios con permisos de escritura pueden ver/editar secretos
- ⚠️ NO subir los archivos `keystore.jks` ni `credentials.json` a GitHub (ya están en .gitignore)

---

## 📝 Información del Keystore (Solo Referencia)

```
Type:                JKS
Key Alias:           6455c3e66d4fe00c9ef22e1dc13b87f6
MD5 Fingerprint:     15:61:E6:BF:F6:EE:E1:62:E4:D3:B8:2E:B9:75:7B:D3
SHA1 Fingerprint:    4A:7A:B1:C1:44:83:C4:A1:26:96:2E:10:8C:34:4B:60:3E:E7:A4:89
SHA256 Fingerprint:  72:54:1B:12:24:65:7A:A6:87:1B:A2:50:B5:92:91:FD:DA:98:08:5D:20:22:F1:C1:D0:55:F3:EB:46:9F:F0:2B
```

Este keystore fue generado y configurado en **EAS (Expo Application Services)** y es el mismo que se usa para builds de producción.

---

## 📧 Contacto

Si tienes preguntas sobre estos secretos, contacta al equipo de desarrollo del proyecto.

**Generado:** 2025-10-15
**Branch:** feature/CSB-47/integrate-CNN-model-unreleased
