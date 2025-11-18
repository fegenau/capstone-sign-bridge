import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function SettingsScreen({
  theme,
  textScale,
  largeText,
  highContrast,
  ttsEnabled,
  confidenceThreshold = 0.6,
  smootherQueueLength = 5,
  onToggleLargeText,
  onToggleHighContrast,
  onToggleTts,
  onConfidenceThresholdChange,
  onSmootherQueueLengthChange
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: theme.fg, fontSize: 22 * textScale }]}>Accesibilidad</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.fg, fontSize: 16 * textScale }]}>Texto grande</Text>
        <Switch value={largeText} onValueChange={onToggleLargeText} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.fg, fontSize: 16 * textScale }]}>Alto contraste</Text>
        <Switch value={highContrast} onValueChange={onToggleHighContrast} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.fg, fontSize: 16 * textScale }]}>Texto a voz (TTS)</Text>
        <Switch value={ttsEnabled} onValueChange={onToggleTts} />
      </View>

      {/* Advanced Settings */}
      <View style={[styles.section, { marginTop: 24 }]}>
        <Text
          style={[styles.sectionTitle, { color: theme.fg, fontSize: 18 * textScale }]}
          onPress={() => setShowAdvanced(!showAdvanced)}
          accessibilityRole="button"
        >
          {showAdvanced ? '▼' : '▶'} Configuración avanzada
        </Text>

        {showAdvanced && (
          <>
            <View style={styles.settingGroup}>
              <Text style={[styles.label, { color: theme.fg, fontSize: 14 * textScale }]}>
                Umbral de confianza: {(confidenceThreshold * 100).toFixed(0)}%
              </Text>
              <input
                type="range"
                min="30"
                max="95"
                step="5"
                value={confidenceThreshold * 100}
                onChange={(e) => onConfidenceThresholdChange(parseFloat(e.target.value) / 100)}
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${confidenceThreshold * 100}%, rgba(255,255,255,0.2) ${confidenceThreshold * 100}%, rgba(255,255,255,0.2) 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  marginVertical: 8
                }}
                aria-label="Ajustar umbral de confianza"
              />
              <Text style={[styles.help, { color: theme.fg, fontSize: 12 * textScale }]}>
                La predicción debe tener al menos esta confianza para ser considerada.
              </Text>
            </View>

            <View style={styles.settingGroup}>
              <Text style={[styles.label, { color: theme.fg, fontSize: 14 * textScale }]}>
                Estabilidad de predicción: {smootherQueueLength} frames
              </Text>
              <input
                type="range"
                min="3"
                max="10"
                step="1"
                value={smootherQueueLength}
                onChange={(e) => onSmootherQueueLengthChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  background: `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((smootherQueueLength - 3) / 7) * 100}%, rgba(255,255,255,0.2) ${((smootherQueueLength - 3) / 7) * 100}%, rgba(255,255,255,0.2) 100%)`,
                  outline: 'none',
                  cursor: 'pointer',
                  marginVertical: 8
                }}
                aria-label="Ajustar longitud de suavizado"
              />
              <Text style={[styles.help, { color: theme.fg, fontSize: 12 * textScale }]}>
                Mayor valor = más estable pero más lento.
              </Text>
            </View>
          </>
        )}
      </View>

      <Text style={{ color: theme.fg, opacity: 0.9, marginTop: 24, fontSize: 13 * textScale }}>
        Nota: En iOS Safari, la cámara necesita interacción previa del usuario para inicializarse.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16, gap: 12 },
  title: { fontWeight: '900', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.1)' },
  label: { fontWeight: '700' },
  section: { paddingTop: 12 },
  sectionTitle: { fontWeight: '800', marginBottom: 12, paddingHorizontal: 0 },
  settingGroup: { paddingVertical: 12, paddingHorizontal: 12, marginBottom: 12, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  help: { marginTop: 8, fontStyle: 'italic', opacity: 0.8 }
});
