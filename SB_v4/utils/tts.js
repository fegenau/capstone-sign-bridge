import { Platform } from 'react-native';

/**
 * Cross-platform Text-to-Speech helper.
 * - On native (iOS/Android): uses expo-speech
 * - On web: uses the Web Speech API to avoid expo-speech web registration errors
 */
export function speak(text, options = {}) {
  if (!text) return;

  if (Platform.OS === 'web') {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

      // Cancel any pending speech to avoid queue piling
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(String(text));
      // Map basic options
      if (options.language) utter.lang = options.language;
      if (options.rate) utter.rate = options.rate; // 0.1 - 10
      if (options.pitch) utter.pitch = options.pitch; // 0 - 2

      window.speechSynthesis.speak(utter);
    } catch (e) {
      // Silently ignore on web; TTS is optional UX sugar
    }
    return;
  }

  // Native platforms
  try {
    // Require lazily to avoid bundling the web implementation
    // which calls registerWebModule at import time.
    // eslint-disable-next-line global-require
    const Speech = require('expo-speech');
    Speech.speak(String(text), options);
  } catch (e) {
    // Ignore failures; app should continue without TTS
  }
}
