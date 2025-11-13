module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/'],
  moduleNameMapper: {
    '@mediapipe/tasks-vision': '<rootDir>/__mocks__/@mediapipe__tasks-vision.js',
    '@tensorflow/tfjs': '<rootDir>/__mocks__/@tensorflow__tfjs.js',
    '@tensorflow/tfjs-backend-webgl': '<rootDir>/__mocks__/@tensorflow__tfjs.js',
  },
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  testTimeout: 10000,
  // Don't transform node_modules, that's the issue
  transformIgnorePatterns: [
    '/node_modules/',
  ],
  // Only transform our test and source files
  testPathIgnorePatterns: ['/node_modules/'],
};
