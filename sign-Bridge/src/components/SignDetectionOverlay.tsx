/*
 * SignDetectionOverlay.tsx
 * Superposición sobre la cámara mostrando predicción y progreso de buffer.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  prediction: string | null;
  confidence: number;
  frameCount: number; // 0..24
}

export const SignDetectionOverlay: React.FC<Props> = ({ prediction, confidence, frameCount }) => {
  const pct = Math.min(1, frameCount / 24);
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.box}>
        <Text style={styles.title}>Detección de Señas</Text>
        <View style={styles.row}><Text style={styles.label}>Frames:</Text><Text style={styles.value}>{frameCount} / 24</Text></View>
        <View style={styles.progressOuter}> <View style={[styles.progressInner, { width: `${pct * 100}%` }]} /> </View>
        <View style={styles.row}><Text style={styles.label}>Predicción:</Text><Text style={styles.prediction}>{prediction ?? '—'}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Confianza:</Text><Text style={[styles.value, confidence >= 0.5 ? styles.good : styles.bad]}>{(confidence * 100).toFixed(1)}%</Text></View>
        <View style={styles.confidenceBarOuter}><View style={[styles.confidenceBarInner, { width: `${confidence * 100}%`, backgroundColor: confidence >= 0.5 ? '#4caf50' : '#ff9800' }]} /></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, padding: 12 },
  box: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 12 },
  title: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  label: { color: '#ccc', fontSize: 12 },
  value: { color: '#fff', fontSize: 12 },
  prediction: { color: '#fff', fontSize: 14, fontWeight: '500' },
  progressOuter: { height: 6, backgroundColor: '#333', borderRadius: 4, overflow: 'hidden', marginTop: 6 },
  progressInner: { height: 6, backgroundColor: '#2196f3' },
  confidenceBarOuter: { height: 10, backgroundColor: '#222', borderRadius: 5, overflow: 'hidden', marginTop: 8 },
  confidenceBarInner: { height: 10 },
  good: { color: '#4caf50' },
  bad: { color: '#ff9800' },
});

export default SignDetectionOverlay;
