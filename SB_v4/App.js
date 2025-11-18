import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DetectScreen from './screens/DetectScreen';
import ManualScreen from './screens/ManualScreen';
import SettingsScreen from './screens/SettingsScreen';
import HomeScreen from './screens/HomeScreen';

export default function App() {
  const [tab, setTab] = useState('detect');
  const [largeText, setLargeText] = useState(true);
  const [highContrast, setHighContrast] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [smootherQueueLength, setSmootherQueueLength] = useState(5);

  const theme = highContrast ? themes.highContrast : themes.default;
  const textScale = largeText ? 1.2 : 1.0;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.navbar}>
        {['home', 'detect', 'manual', 'settings'].map(key => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.tabBtn, tab === key && { backgroundColor: theme.accent }]}>
            <Text style={[styles.tabText, { color: theme.fg }]}>
              {key.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.content}>
        {tab === 'home' && <HomeScreen theme={theme} textScale={textScale} />}
        {tab === 'detect' && (
          <DetectScreen
            theme={theme}
            textScale={textScale}
            ttsEnabled={ttsEnabled}
            confidenceThreshold={confidenceThreshold}
            smootherQueueLength={smootherQueueLength}
          />
        )}
        {tab === 'manual' && <ManualScreen theme={theme} textScale={textScale} />}
        {tab === 'settings' && (
          <SettingsScreen
            theme={theme}
            textScale={textScale}
            largeText={largeText}
            highContrast={highContrast}
            ttsEnabled={ttsEnabled}
            confidenceThreshold={confidenceThreshold}
            smootherQueueLength={smootherQueueLength}
            onToggleLargeText={() => setLargeText(x => !x)}
            onToggleHighContrast={() => setHighContrast(x => !x)}
            onToggleTts={() => setTtsEnabled(x => !x)}
            onConfidenceThresholdChange={setConfidenceThreshold}
            onSmootherQueueLengthChange={setSmootherQueueLength}
          />
        )}
      </View>
    </View>
  );
}

const themes = {
  default: { bg: '#0b0b0b', fg: '#eaeaea', accent: '#22c55e', weak: '#888' },
  highContrast: { bg: '#000', fg: '#fff', accent: '#00FF88', weak: '#aaa' },
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  navbar: { flexDirection: 'row', padding: 8, gap: 8, justifyContent: 'space-around', backgroundColor: '#111' },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  tabText: { fontSize: 14, fontWeight: '700' },
  content: { flex: 1 }
});
