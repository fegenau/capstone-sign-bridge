import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen({ theme, textScale }) {
  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.fg, fontSize: 28 * textScale }]}>SignBridge v4</Text>
      <Text style={[styles.p, { color: theme.fg, fontSize: 16 * textScale }]}>Lengua de Señas Chilena (LSCh). Usa la pestaña Detectar para iniciar la cámara.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  p: { textAlign: 'center', opacity: 0.9 }
});
