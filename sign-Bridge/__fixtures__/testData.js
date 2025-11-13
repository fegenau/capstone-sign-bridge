/**
 * __fixtures__/testData.js
 *
 * Test data fixtures for MonolithicDetectionScreen tests
 * Contains realistic data that mimics production values
 */

// ============================================================================
// MEDIAIPE TEST DATA - Realistic hand landmarks
// ============================================================================

/**
 * Generate realistic hand landmarks (21 points per hand)
 * MediaPipe returns landmarks as [x, y, z] normalized to [0, 1]
 */
const generateMockHandLandmarks = (handType = 'left', variation = 0) => {
  // Base landmarks for a relaxed hand position
  const basePositions = [
    [0.5, 0.5, 0.0],     // 0: Wrist
    [0.45, 0.4, 0.1],    // 1: Thumb CMC
    [0.42, 0.35, 0.15],  // 2: Thumb MCP
    [0.40, 0.30, 0.18],  // 3: Thumb IP
    [0.38, 0.25, 0.20],  // 4: Thumb TIP
    [0.52, 0.35, 0.1],   // 5: Index MCP
    [0.54, 0.28, 0.15],  // 6: Index PIP
    [0.55, 0.22, 0.18],  // 7: Index DIP
    [0.56, 0.15, 0.20],  // 8: Index TIP
    [0.55, 0.38, 0.08],  // 9: Middle MCP
    [0.58, 0.30, 0.12],  // 10: Middle PIP
    [0.60, 0.23, 0.15],  // 11: Middle DIP
    [0.62, 0.15, 0.18],  // 12: Middle TIP
    [0.57, 0.42, 0.08],  // 13: Ring MCP
    [0.60, 0.34, 0.12],  // 14: Ring PIP
    [0.63, 0.27, 0.15],  // 15: Ring DIP
    [0.65, 0.20, 0.18],  // 16: Ring TIP
    [0.59, 0.45, 0.08],  // 17: Pinky MCP
    [0.62, 0.38, 0.12],  // 18: Pinky PIP
    [0.65, 0.31, 0.15],  // 19: Pinky DIP
    [0.68, 0.25, 0.18],  // 20: Pinky TIP
  ];

  // Add variation for different gestures
  const variationFactors = [
    0,      // Neutral
    0.05,   // Slightly moved
    -0.03,  // Different angle
    0.02,   // Rotation
    -0.04,  // Scale variation
  ];

  const factor = variationFactors[variation % variationFactors.length];

  return basePositions.map((pos) => ({
    x: Math.max(0, Math.min(1, pos[0] + factor)),
    y: Math.max(0, Math.min(1, pos[1] + factor)),
    z: Math.max(0, Math.min(1, pos[2] + factor)),
  }));
};

/**
 * Create a mock MediaPipe detection result
 */
const createMockDetectionResult = (hasLeftHand = true, hasRightHand = true) => {
  const landmarks = [];
  const handedness = [];

  if (hasLeftHand) {
    landmarks.push(generateMockHandLandmarks('left', 0));
    handedness.push([{ categoryName: 'Left' }]);
  }

  if (hasRightHand) {
    landmarks.push(generateMockHandLandmarks('right', 1));
    handedness.push([{ categoryName: 'Right' }]);
  }

  return {
    landmarks,
    handedness,
  };
};

/**
 * Create a frame with combined hand keypoints (126 dimensions)
 * [0-62]: Left hand (21 joints × 3 axes)
 * [63-125]: Right hand (21 joints × 3 axes)
 */
const createMockFrame = (variation = 0) => {
  const frame = new Float32Array(126);

  // Left hand keypoints
  const leftLandmarks = generateMockHandLandmarks('left', variation);
  let idx = 0;
  leftLandmarks.forEach((landmark) => {
    frame[idx++] = landmark.x;
    frame[idx++] = landmark.y;
    frame[idx++] = landmark.z;
  });

  // Right hand keypoints
  const rightLandmarks = generateMockHandLandmarks('right', variation + 1);
  idx = 63;
  rightLandmarks.forEach((landmark) => {
    frame[idx++] = landmark.x;
    frame[idx++] = landmark.y;
    frame[idx++] = landmark.z;
  });

  return frame;
};

/**
 * Create a full buffer of frames (24 frames × 126 dims)
 */
const createMockFrameBuffer = (numFrames = 24) => {
  const buffer = [];
  for (let i = 0; i < numFrames; i++) {
    buffer.push(createMockFrame(i % 5));
  }
  return buffer;
};

// ============================================================================
// TENSORFLOW TEST DATA - Realistic predictions
// ============================================================================

/**
 * LSCh labels (67 classes)
 */
const MOCK_LABELS = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'A_la_derecha', 'A_la_izquierda', 'Adios', 'Al_final_del_pasillo',
  'B', 'C', 'Como', 'Como_estas', 'Como_te_llamas',
  'Cuando', 'Cuantos', 'Cuidate', 'D', 'Donde',
  'E', 'En_el_edificio', 'En_el_segundo_piso', 'En_la_entrada', 'F',
  'G', 'Gracias', 'H', 'Hola', 'I',
  'J', 'K', 'L', 'M', 'Mi_casa',
  'Mi_nombre', 'N', 'No_lo_recuerdo', 'No_lo_se', 'Nos_vemos',
  'O', 'P', 'Permiso', 'Por_el_ascensor', 'Por_favor',
  'Por_las_escaleras', 'Por_que', 'Q', 'Que_quieres', 'Quien',
  'R', 'Repite_por_favor', 'S', 'Si', 'T',
  'Tal_vez', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

/**
 * Create realistic softmax predictions (67 values, sum=1)
 * Peak at specific index with realistic confidence curve
 */
const createMockPredictions = (peakIndex = 0, confidence = 0.85) => {
  const predictions = new Float32Array(67);

  // Allocate peak confidence to target class
  predictions[peakIndex] = confidence;

  // Distribute remaining probability across other classes
  const remaining = 1 - confidence;
  const otherClassCount = 66;
  const baseProb = remaining / otherClassCount;

  for (let i = 0; i < 67; i++) {
    if (i !== peakIndex) {
      // Add small variation to make it realistic
      const variation = (Math.random() - 0.5) * baseProb * 0.5;
      predictions[i] = Math.max(0, baseProb + variation);
    }
  }

  // Normalize to ensure sum = 1
  const sum = Array.from(predictions).reduce((a, b) => a + b, 0);
  return Float32Array.from(predictions.map((p) => p / sum));
};

/**
 * Create predictions with specific class and confidence
 */
const createMockPredictionForClass = (className, confidence = 0.85) => {
  const index = MOCK_LABELS.indexOf(className);
  if (index === -1) {
    throw new Error(`Unknown class: ${className}`);
  }
  return createMockPredictions(index, confidence);
};

/**
 * Get top N predictions from prediction array
 */
const getTopPredictions = (predictions, n = 3) => {
  const indexed = Array.from(predictions).map((conf, idx) => ({
    index: idx,
    label: MOCK_LABELS[idx],
    confidence: conf,
  }));

  return indexed
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, n);
};

// ============================================================================
// MOCK TENSOR DATA
// ============================================================================

/**
 * Create mock TensorFlow tensor
 */
const createMockTensor = (shape, data) => {
  return {
    shape,
    data: async () => new Float32Array(data),
    dataSync: () => new Float32Array(data),
    dispose: jest.fn(),
  };
};

/**
 * Create input tensor [1, 24, 126]
 */
const createInputTensor = () => {
  const data = new Array(1 * 24 * 126).fill(0);
  const frameBuffer = createMockFrameBuffer(24);

  let idx = 0;
  frameBuffer.forEach((frame) => {
    frame.forEach((value) => {
      data[idx++] = value;
    });
  });

  return createMockTensor([1, 24, 126], data);
};

/**
 * Create output tensor [1, 67]
 */
const createOutputTensor = (peakIndex = 0) => {
  const predictions = createMockPredictions(peakIndex, 0.85);
  return createMockTensor([1, 67], Array.from(predictions));
};

// ============================================================================
// CAMERA MOCK DATA
// ============================================================================

/**
 * Create mock video element
 */
const createMockVideo = () => {
  return {
    videoWidth: 640,
    videoHeight: 480,
    play: jest.fn(),
    pause: jest.fn(),
    load: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
};

/**
 * Create mock camera stream
 */
const createMockStream = () => {
  return {
    getTracks: jest.fn(() => [
      {
        stop: jest.fn(),
        enabled: true,
      },
    ]),
  };
};

// ============================================================================
// TIMING DATA
// ============================================================================

/**
 * Realistic timing data
 */
const TIMING_BENCHMARKS = {
  MODEL_LOAD: 350, // ms
  MEDIAIPE_INIT: 250, // ms
  WARMUP_INFERENCE: 50, // ms
  HAND_DETECTION: 8, // ms per frame
  FRAME_PROCESSING: 5, // ms per frame
  MODEL_INFERENCE: 12, // ms per inference
  TOTAL_INIT: 600, // ms
  BUFFER_FILL: 800, // ms @ 30 FPS (24 frames)
  TOTAL_FIRST_DETECTION: 1400, // ms
};

// ============================================================================
// UI TEST DATA
// ============================================================================

/**
 * Mock detection result
 */
const createMockDetectionResult_UI = () => {
  const predictions = createMockPredictions(33, 0.87); // 'Hola'
  return {
    word: MOCK_LABELS[33],
    confidence: 0.87,
    index: 33,
    allPredictions: predictions,
    timestamp: Date.now(),
  };
};

/**
 * Mock props for MonolithicDetectionScreen
 */
const createMockScreenProps = () => {
  return {
    navigation: {
      goBack: jest.fn(),
      navigate: jest.fn(),
    },
  };
};

// ============================================================================
// ERROR SCENARIOS
// ============================================================================

/**
 * Create error scenarios for testing
 */
const ERROR_SCENARIOS = {
  NO_HANDS: {
    detection: { landmarks: [], handedness: [] },
    description: 'No hands detected',
  },
  ONE_HAND: {
    detection: createMockDetectionResult(true, false),
    description: 'Only left hand detected',
  },
  POOR_LANDMARKS: {
    // Landmarks too close to edges (unreliable)
    detection: {
      landmarks: [
        Array(21)
          .fill(0)
          .map(() => ({
            x: Math.random() * 0.1, // Close to 0 edge
            y: Math.random() * 0.1,
            z: Math.random() * 0.1,
          })),
      ],
      handedness: [[{ categoryName: 'Left' }]],
    },
    description: 'Landmarks at edge of frame',
  },
  NAN_VALUES: {
    detection: {
      landmarks: [
        Array(21)
          .fill(0)
          .map(() => ({
            x: NaN,
            y: NaN,
            z: NaN,
          })),
      ],
      handedness: [[{ categoryName: 'Left' }]],
    },
    description: 'NaN values in landmarks',
  },
  ZERO_CONFIDENCE: {
    predictions: new Float32Array(67).map(() => 1 / 67),
    description: 'All predictions equal (no confidence)',
  },
  SINGLE_HIGH_CLASS: {
    predictions: createMockPredictions(0, 0.99),
    description: 'Single class with 99% confidence',
  },
};

// ============================================================================
// PERFORMANCE TEST DATA
// ============================================================================

/**
 * Create sequential frames for performance testing
 */
const createSequentialFrames = (count = 100) => {
  const frames = [];
  for (let i = 0; i < count; i++) {
    frames.push({
      timestamp: Date.now() + i * 33, // 30 FPS
      data: createMockFrame(i % 5),
    });
  }
  return frames;
};

/**
 * Test data for consistency validation
 */
const CONSISTENCY_TESTS = {
  SAME_GESTURE_MULTIPLE_TIMES: {
    description: 'Same gesture detected 3 times',
    gestures: ['Hola', 'Hola', 'Hola'],
    expectedConsistency: 0.95,
  },
  DIFFERENT_GESTURES: {
    description: 'Different gestures in sequence',
    gestures: ['Hola', 'Adios', 'Gracias'],
    expectedConsistency: 0.0,
  },
  SIMILAR_GESTURES: {
    description: 'Similar but different gestures',
    gestures: ['Como', 'Como_estas'],
    expectedConsistency: 0.5,
  },
};

// ============================================================================
// EXPORT ALL
// ============================================================================

module.exports = {
  // MediaPipe
  generateMockHandLandmarks,
  createMockDetectionResult,
  createMockFrame,
  createMockFrameBuffer,

  // TensorFlow
  MOCK_LABELS,
  createMockPredictions,
  createMockPredictionForClass,
  getTopPredictions,
  createMockTensor,
  createInputTensor,
  createOutputTensor,

  // Camera
  createMockVideo,
  createMockStream,

  // Timing
  TIMING_BENCHMARKS,

  // UI
  createMockDetectionResult_UI,
  createMockScreenProps,

  // Errors
  ERROR_SCENARIOS,

  // Performance
  createSequentialFrames,
  CONSISTENCY_TESTS,
};
