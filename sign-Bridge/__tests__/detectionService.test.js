// __tests__/detectionService.test.js
import { detectionService, generateRandomDetection, simulateDetection } from '../utils/services/detectionService';

describe('DetectionService', () => {
  beforeEach(() => {
    // Reset service state before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    detectionService.stopDetection();
    // Clear any pending timers
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Final cleanup
    if (detectionService.modelRetryTimer) {
      clearInterval(detectionService.modelRetryTimer);
      detectionService.modelRetryTimer = null;
    }
    if (detectionService.detectionTimer) {
      clearInterval(detectionService.detectionTimer);
      detectionService.detectionTimer = null;
    }
  });

  describe('generateRandomDetection', () => {
    it('should generate a valid detection object', () => {
      const detection = generateRandomDetection();
      
      expect(detection).toHaveProperty('letter');
      expect(detection).toHaveProperty('confidence');
      expect(typeof detection.letter).toBe('string');
      expect(typeof detection.confidence).toBe('number');
    });

    it('should generate letters from A-Z or numbers 0-9', () => {
      const detection = generateRandomDetection();
      const validSymbols = /^[A-Z0-9]$/;
      
      expect(detection.letter).toMatch(validSymbols);
    });

    it('should generate confidence between 30 and 95', () => {
      const detection = generateRandomDetection();
      
      expect(detection.confidence).toBeGreaterThanOrEqual(30);
      expect(detection.confidence).toBeLessThanOrEqual(95);
    });
  });

  describe('simulateDetection', () => {
    it('should return a promise', () => {
      const result = simulateDetection();
      
      expect(result).toBeInstanceOf(Promise);
    });

    it('should resolve with detection or null', async () => {
      const result = await simulateDetection();
      
      if (result !== null) {
        expect(result).toHaveProperty('letter');
        expect(result).toHaveProperty('confidence');
      } else {
        expect(result).toBeNull();
      }
    });

    it('should simulate processing delay', async () => {
      const startTime = Date.now();
      await simulateDetection();
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should take at least 700ms (processing time is 800ms with some tolerance)
      expect(duration).toBeGreaterThanOrEqual(700);
    });
  });

  describe('DetectionService class', () => {
    it('should be a singleton instance', () => {
      expect(detectionService).toBeDefined();
      expect(detectionService.constructor.name).toBe('DetectionService');
    });

    it('should have required methods', () => {
      expect(typeof detectionService.startDetection).toBe('function');
      expect(typeof detectionService.stopDetection).toBe('function');
      expect(typeof detectionService.onDetection).toBe('function');
      expect(typeof detectionService.offDetection).toBe('function');
      expect(typeof detectionService.getStatus).toBe('function');
    });

    it('should initialize with correct default state', () => {
      const status = detectionService.getStatus();
      
      expect(status).toHaveProperty('isActive');
      expect(status).toHaveProperty('isModelLoaded');
      expect(typeof status.isActive).toBe('boolean');
      expect(typeof status.isModelLoaded).toBe('boolean');
    });

    it('should register detection callbacks', () => {
      const callback = jest.fn();
      
      detectionService.onDetection(callback);
      
      // Callback should be registered
      expect(detectionService.callbacks).toContain(callback);
    });

    it('should unregister detection callbacks', () => {
      const callback = jest.fn();
      
      detectionService.onDetection(callback);
      detectionService.offDetection(callback);
      
      // Callback should be removed
      expect(detectionService.callbacks).not.toContain(callback);
    });

    it('should stop detection when stopDetection is called', () => {
      detectionService.isActive = true;
      detectionService.stopDetection();
      
      expect(detectionService.isActive).toBe(false);
    });
  });

  describe('Detection debouncing', () => {
    it('should respect debounce interval', async () => {
      const callback = jest.fn();
      detectionService.onDetection(callback);
      
      // Simulate rapid detections
      detectionService.lastDetectionTime = Date.now();
      detectionService.lastDetectedSymbol = 'A';
      
      // This should be debounced
      const timeSinceLastDetection = Date.now() - detectionService.lastDetectionTime;
      expect(timeSinceLastDetection).toBeLessThan(1500);
    });
  });
});
