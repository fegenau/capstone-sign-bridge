import React, { useRef, useState } from 'react';
import { View, Text, Button, TouchableOpacity, Image, StyleSheet, Linking, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function CameraScreen() {
  // Permisos con el hook oficial de expo-camera (SDK 54)
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<React.ElementRef<typeof CameraView> | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Si permiso es undefined (aún no se resolvió), mostramos mensaje de carga
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Comprobando permisos...</Text>
      </View>
    );
  }

  // Si no está concedido
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 12 }}>
          La aplicación necesita acceso a la cámara para funcionar.
        </Text>

        <Button title="Pedir permiso" onPress={() => requestPermission()} />

        <View style={{ height: 12 }} />

        <Button
          title="Abrir ajustes (iOS/Android)"
          onPress={async () => {
            // abrir los ajustes de la app para que el usuario active permisos manualmente
            try {
              await Linking.openSettings();
            } catch (e) {
              Alert.alert('No se pueden abrir los ajustes desde aquí', 'Por favor abre los ajustes manualmente.');
            }
          }}
        />

        <View style={{ height: 16 }} />
        <Text style={{ color: '#666', fontSize: 12, textAlign: 'center' }}>
          Si el permiso fue negado permanentemente, activa la cámara desde Ajustes → tu app.
        </Text>
      </View>
    );
  }

  // Permiso concedido -> mostrar cámara
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={(ref) => {
          cameraRef.current = ref;
        }}
        onCameraReady={() => setIsCameraReady(true)}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => {
            setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
          }}
        >
          <Text style={styles.btnText}>Cambiar cámara</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, !isCameraReady && { opacity: 0.5 }]}
          disabled={!isCameraReady}
          onPress={async () => {
            if (!cameraRef.current) return;
            try {
              const photo: any = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false } as any);
              const uri = photo?.uri ?? photo?.assets?.[0]?.uri;
              if (uri) {
                setPhotoUri(uri);
              } else {
                throw new Error('No se obtuvo la URI de la foto');
              }
            } catch (err) {
              console.error('Error al tomar foto', err);
              Alert.alert('Error', 'No se pudo tomar la foto.');
            }
          }}
        >
          <Text style={styles.btnText}>Tomar foto</Text>
        </TouchableOpacity>

        {photoUri ? (
          <>
            <Image source={{ uri: photoUri }} style={styles.preview} />
            <Button title="Borrar foto" onPress={() => setPhotoUri(null)} />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  controls: {
    padding: 12,
    backgroundColor: '#fff',
  },
  btn: {
    padding: 12,
    backgroundColor: '#222',
    marginBottom: 8,
    borderRadius: 8,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
  },
  preview: {
    width: '100%',
    height: 200,
    marginTop: 12,
    borderRadius: 8,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
});
