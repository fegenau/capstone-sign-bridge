/**
 * Jest Setup File
 * Configure testing environment for MonolithicDetectionScreen tests
 */

// Mock React Native modules
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  Dimensions: {
    get: jest.fn((type) => {
      if (type === 'window') {
        return { width: 375, height: 812 };
      }
      return { width: 375, height: 812 };
    }),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn(({ ios, android, web }) => ios),
  },
  Animated: {
    Value: jest.fn(() => ({
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    loop: jest.fn((anim) => anim),
    parallel: jest.fn((anims) => ({
      start: jest.fn((cb) => cb && cb()),
    })),
    createAnimatedComponent: jest.fn((component) => component),
  },
  StyleSheet: {
    create: jest.fn((styles) => styles),
  },
  useWindowDimensions: jest.fn(() => ({
    width: 375,
    height: 812,
  })),
}));

// Mock expo-camera
jest.mock('expo-camera', () => ({
  Camera: 'Camera',
  useCameraPermissions: jest.fn(() => [{ granted: true }, jest.fn()]),
  CameraType: {
    front: 'front',
    back: 'back',
  },
}));

// Suppress console errors during tests (optional)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test timeout
jest.setTimeout(10000);
