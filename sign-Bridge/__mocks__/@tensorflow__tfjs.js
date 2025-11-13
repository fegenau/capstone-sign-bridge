/**
 * __mocks__/@tensorflow/tfjs.js
 *
 * Mock TensorFlow.js for testing
 * Simulates realistic model behavior
 */

// Simple mock implementations to avoid dependency on testData
const createOutputTensor = (peakIndex) => {
  const data = new Float32Array(67);
  for (let i = 0; i < 67; i++) {
    data[i] = i === peakIndex ? 0.9 : Math.random() * 0.05;
  }
  // Normalize to softmax
  const sum = data.reduce((a, b) => a + b);
  for (let i = 0; i < 67; i++) {
    data[i] /= sum;
  }
  return {
    data: async () => data,
    dataSync: () => data,
    dispose: jest.fn(),
    shape: [1, 67],
  };
};

/**
 * Mock TensorFlow model
 */
const mockModel = {
  predict: jest.fn((input) => {
    // Simulate inference latency
    const startTime = Date.now();

    // Random peak index (which class)
    const peakIndex = Math.floor(Math.random() * 67);

    const output = createOutputTensor(peakIndex);

    // Measure inference time
    const inferenceTime = Date.now() - startTime;

    return output;
  }),

  dispose: jest.fn(),

  inputs: [
    {
      shape: [null, 24, 126],
    },
  ],

  outputs: [
    {
      shape: [null, 67],
    },
  ],
};

/**
 * Mock tensors
 */
const createMockTensor = (shape, data = null) => {
  return {
    shape,
    data: async () =>
      data || new Float32Array(shape.reduce((a, b) => a * b, 1)),
    dataSync: () =>
      data || new Float32Array(shape.reduce((a, b) => a * b, 1)),
    dispose: jest.fn(),
    clone: jest.fn(function () {
      return createMockTensor(this.shape, data);
    }),
  };
};

/**
 * Mock TensorFlow.js module
 */
const tf = {
  // Tensor creation
  tensor: jest.fn((data) => createMockTensor([data.length], data)),
  tensor1d: jest.fn((data) => createMockTensor([data.length], data)),
  tensor2d: jest.fn((data, shape) => createMockTensor(shape, data)),
  tensor3d: jest.fn((data, shape) => createMockTensor(shape, data)),

  randomNormal: jest.fn((shape) => {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random();
    }
    return createMockTensor(shape, data);
  }),

  randomUniform: jest.fn((shape) => {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random();
    }
    return createMockTensor(shape, data);
  }),

  // Operations
  softmax: jest.fn((tensor, axis = -1) => {
    return tensor;
  }),

  // Model loading
  loadLayersModel: jest.fn(async (path) => {
    // Simulate model loading latency
    await new Promise((resolve) => setTimeout(resolve, 20));
    return mockModel;
  }),

  // Utilities
  ready: jest.fn(async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    return undefined;
  }),

  getBackend: jest.fn(() => 'webgl'),

  setBackend: jest.fn(async (backend) => {
    return true;
  }),

  // Memory
  memory: jest.fn(() => ({
    numTensors: 5,
    numDataBuffers: 5,
    numBytes: 1024 * 1024,
    unreliable: false,
  })),

  // Version info
  version: {
    tfjs: '4.22.0',
  },

  // Backend WebGL
  ENV: {
    set: jest.fn(),
    get: jest.fn(),
  },
};

module.exports = tf;
module.exports.default = tf;
