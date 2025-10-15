// Jest setup file
// Note: @testing-library/react-native v12.4+ includes built-in Jest matchers
// No need to import extend-expect separately

// Mock Expo modules
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: () => [
    { granted: true },
    jest.fn()
  ],
}));

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  documentDirectory: 'file://mock/',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  NavigationContainer: ({ children }) => children,
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: jest.fn(),
}));

// Silence console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
