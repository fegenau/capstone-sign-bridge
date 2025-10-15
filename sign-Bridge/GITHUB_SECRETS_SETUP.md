# Configuración de GitHub Secrets para Firma de APK

## 📋 Instrucciones

Necesitas agregar estos 4 secretos en tu repositorio de GitHub para que el workflow pueda firmar el APK en modo release.

### 🔑 Secretos a Configurar

1. **ANDROID_KEYSTORE_BASE64**
   - Ve a: https://github.com/fegenau/capstone-sign-bridge/settings/secrets/actions
   - Click en "New repository secret"
   - Name: `ANDROID_KEYSTORE_BASE64`
   - Value: Copia el contenido completo del archivo `keystore-base64.txt` (ubicado en esta carpeta)
   - Click "Add secret"

2. **ANDROID_KEYSTORE_PASSWORD**
   - Name: `ANDROID_KEYSTORE_PASSWORD`
   - Value: `3b11cbf3cbe06cb9aadc36c9151147a0`
   - Click "Add secret"

3. **ANDROID_KEY_ALIAS**
   - Name: `ANDROID_KEY_ALIAS`
   - Value: `6455c3e66d4fe00c9ef22e1dc13b87f6`
   - Click "Add secret"

4. **ANDROID_KEY_PASSWORD**
   - Name: `ANDROID_KEY_PASSWORD`
   - Value: `0e102d10eb4d7068982f24d1ee6f3c29`
   - Click "Add secret"

---

## 🎯 Verificación

Después de agregar los secretos, ve a:
https://github.com/fegenau/capstone-sign-bridge/settings/secrets/actions

Deberías ver estos 4 secretos listados:
- ✅ ANDROID_KEYSTORE_BASE64
- ✅ ANDROID_KEYSTORE_PASSWORD
- ✅ ANDROID_KEY_ALIAS
- ✅ ANDROID_KEY_PASSWORD

---

## 🚀 Próximo Paso

Una vez configurados los secretos:
1. Haz push de cualquier cambio al branch `feature/CSB-47/integrate-CNN-model-unreleased`
2. El workflow se ejecutará automáticamente
3. Esta vez generará `app-release.apk` (firmado) en lugar de `app-debug.apk`

---

## 📝 Información del Keystore

```
Type:                JKS
Key Alias:           6455c3e66d4fe00c9ef22e1dc13b87f6
MD5 Fingerprint:     15:61:E6:BF:F6:EE:E1:62:E4:D3:B8:2E:B9:75:7B:D3
SHA1 Fingerprint:    4A:7A:B1:C1:44:83:C4:A1:26:96:2E:10:8C:34:4B:60:3E:E7:A4:89
SHA256 Fingerprint:  72:54:1B:12:24:65:7A:A6:87:1B:A2:50:B5:92:91:FD:DA:98:08:5D:20:22:F1:C1:D0:55:F3:EB:46:9F:F0:2B
```

---

## ⚠️ IMPORTANTE

- **NO SUBAS** el archivo `keystore.jks` ni `credentials.json` a GitHub
- El archivo `.gitignore` ya está configurado para ignorar estas credenciales
- Los secretos en GitHub Actions están encriptados y son seguros
- Solo usuarios con permisos de escritorio pueden ver/editar secretos
