import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import DetectScreen from './screens/DetectScreen';
import ManualScreen from './screens/ManualScreen';
import SettingsScreen from './screens/SettingsScreen';
import HomeScreen from './screens/HomeScreen';
import LearnScreen from './screens/LearnScreen';
import SignVideoGallery from './screens/SignVideoGallery';
import ChallengeScreen from './screens/ChallengeScreen';

export default function App() {
  const [tab, setTab] = useState('home');
  const [largeText, setLargeText] = useState(true);
  const [highContrast, setHighContrast] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [smootherQueueLength, setSmootherQueueLength] = useState(5);

  const theme = highContrast ? themes.highContrast : themes.default;
  const textScale = largeText ? 1.2 : 1.0;

  // Tab configuration with icons and labels
  const tabs = [
    { id: 'home', label: '🏠 Inicio', icon: '🏠' },
    { id: 'detect', label: '🎥 Detectar', icon: '🎥' },
    { id: 'learn', label: '📚 Aprender', icon: '📚' },
    { id: 'gallery', label: '🎬 Videos', icon: '🎬' },
    { id: 'challenges', label: '🎯 Desafíos', icon: '🎯' },
    { id: 'manual', label: '📖 Manual', icon: '📖' },
    { id: 'settings', label: '⚙️ Ajustes', icon: '⚙️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* ENHANCED NAVBAR WITH ICONS */}
      <View style={[styles.navbar, { backgroundColor: theme.bg, borderBottomColor: theme.weak + '30' }]}>
        <Text style={[styles.brandText, { color: theme.accent, fontSize: 16 * textScale }]}>
          🤟 SignBridge
        </Text>
        <View style={styles.navTabs}>
          {tabs.map(tabItem => (
            <Pressable
              key={tabItem.id}
              onPress={() => setTab(tabItem.id)}
              style={[
                styles.navBtn,
                tab === tabItem.id && { backgroundColor: theme.accent },
                tab !== tabItem.id && { backgroundColor: 'transparent' },
              ]}
            >
              <Text style={[
                styles.navIcon,
                { color: tab === tabItem.id ? theme.bg : theme.weak }
              ]}>
                {tabItem.icon}
              </Text>
              {tab === tabItem.id && (
                <Text style={[styles.navLabel, { color: theme.bg, fontSize: 9 * textScale }]}>
                  {tabItem.label.split(' ')[1]}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* CONTENT */}
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
        {tab === 'learn' && <LearnScreen theme={theme} textScale={textScale} />}
        {tab === 'gallery' && <SignVideoGallery theme={theme} textScale={textScale} />}
        {tab === 'challenges' && <ChallengeScreen theme={theme} textScale={textScale} />}
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  brandText: {
    fontWeight: '800',
    marginRight: 12,
    minWidth: 80,
  },
  navTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 4,
  },
  navBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  navIcon: {
    fontSize: 18,
  },
  navLabel: {
    fontWeight: '700',
    marginTop: 2,
  },
  content: { flex: 1 }
});
