// Jest setup file
// Note: @testing-library/react-native v12.4+ includes built-in matchers

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock expo-asset
jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(() => ({
      downloadAsync: jest.fn(() => Promise.resolve()),
      localUri: 'mocked-uri',
    })),
  },
}));

// Mock react-native-tflite
jest.mock('react-native-tflite', () => ({
  TFLiteModule: {
    loadModel: jest.fn(() => Promise.resolve(true)),
    runModelOnImage: jest.fn(() => Promise.resolve([])),
  },
}));
