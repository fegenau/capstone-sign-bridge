/**
 * __mocks__/@mediapipe/tasks-vision.js
 *
 * Mock MediaPipe for testing
 * Simulates realistic hand detection behavior
 */

/**
 * Mock HandLandmarker
 */
const mockHandLandmarker = {
  detectForVideo: jest.fn(async (video, timestamp) => {
    // Simulate detection latency
    await new Promise((resolve) => setTimeout(resolve, 5));

    // 80% chance of detecting hands (realistic)
    if (Math.random() < 0.8) {
      const landmarks = [];

      // Left hand
      if (Math.random() < 0.7) {
        const leftHand = [];
        for (let i = 0; i < 21; i++) {
          leftHand.push({
            x: Math.random(),
            y: Math.random(),
            z: Math.random() * 0.5,
          });
        }
        landmarks.push(leftHand);
      }

      // Right hand
      if (Math.random() < 0.7) {
        const rightHand = [];
        for (let i = 0; i < 21; i++) {
          rightHand.push({
            x: Math.random(),
            y: Math.random(),
            z: Math.random() * 0.5,
          });
        }
        landmarks.push(rightHand);
      }

      return {
        landmarks: landmarks,
        handedness: landmarks.map((_, i) => ({
          displayName: i === 0 ? 'Left' : 'Right',
          index: i,
          score: 0.9 + Math.random() * 0.1,
        })),
      };
    }

    return {
      landmarks: [],
      handedness: [],
    };
  }),

  close: jest.fn(),
};

/**
 * Mock HandLandmarker.createFromOptions
 */
const HandLandmarker = {
  createFromOptions: jest.fn(async (context, options) => {
    // Simulate initialization latency
    await new Promise((resolve) => setTimeout(resolve, 10));

    return mockHandLandmarker;
  }),
};

module.exports = {
  HandLandmarker,
  Vision: {
    HandLandmarker,
  },
};
