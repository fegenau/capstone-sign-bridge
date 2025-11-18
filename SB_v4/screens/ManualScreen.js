import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

const LABELS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'Hola','Gracias','Por_favor','Como_estas','Mi_nombre','Nos_vemos'
];

function labelToPath(label) {
  const file = label.replace(/[^A-Za-z0-9_\-]/g, '_') + '.svg';
  return `/manual/${file}`;
}

export default function ManualScreen({ theme, textScale }) {
  const items = useMemo(() => LABELS.map(l => ({ label: l, src: labelToPath(l) })), []);

  return (
    <ScrollView style={[styles.wrap, { backgroundColor: theme.bg }]}
      contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.fg, fontSize: 22 * textScale }]}>Manual de uso (LSCh)</Text>
      <Text style={{ color: theme.fg, opacity: 0.9, marginBottom: 8, fontSize: 14 * textScale }}>Toca una tarjeta para ver el dibujo de la seña.</Text>
      <View style={styles.grid}>
        {items.map(it => (
          <View key={it.label} style={[styles.card, { borderColor: theme.accent }]}> 
            <Image source={{ uri: it.src }} accessibilityLabel={`Dibujo de la seña ${it.label}`} style={styles.img} onError={() => {}} />
            <Text style={[styles.cap, { color: theme.fg, fontSize: 14 * textScale }]}>{it.label}</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: theme.fg, opacity: 0.8, marginTop: 16, fontSize: 12 * textScale }}>Agrega tus dibujos en SB_v4/public/manual/ con el mismo nombre del label (ej: A.svg, Hola.svg).</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  title: { fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '31%', aspectRatio: 1, borderWidth: 2, borderRadius: 12, overflow: 'hidden', padding: 8, alignItems: 'center', justifyContent: 'center' },
  img: { width: '100%', height: '70%', resizeMode: 'contain' },
  cap: { marginTop: 6, fontWeight: '800', textAlign: 'center' }
});
