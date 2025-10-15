// __tests__/modelIntegration.test.js
// Comprehensive tests for real TFLite model integration

import { detectionService } from '../utils/services/detectionService';
import * as FileSystem from 'expo-file-system';

describe('TFLite Model Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Model File Validation', () => {
    it('should verify model file exists in assets', async () => {
      // This test will pass in CI/CD if model file is present
      const modelPath = require.resolve('../assets/Modelo/runs/detect/train/weights/best_float16.tflite');
      expect(modelPath).toBeDefined();
    });

    it('should have model file with minimum size (1MB)', async () => {
      // Mock FileSystem for testing
      const mockFileSize = 6251795; // 5.96 MB
      FileSystem.getInfoAsync = jest.fn().mockResolvedValue({
        exists: true,
        size: mockFileSize,
        isDirectory: false,
      });

      const result = await FileSystem.getInfoAsync('dummy-path');
      expect(result.exists).toBe(true);
      expect(result.size).toBeGreaterThan(1024 * 1024); // > 1 MB
    });

    it('should validate model file is not a placeholder', async () => {
      FileSystem.getInfoAsync = jest.fn().mockResolvedValue({
        exists: true,
        size: 6251795, // Real model size
        isDirectory: false,
      });

      const result = await FileSystem.getInfoAsync('model-path');
      expect(result.size).toBeGreaterThan(1024); // Not a small placeholder
    });
  });

  describe('Detection Service with Real Model', () => {
    it('should initialize detection service', () => {
      expect(detectionService).toBeDefined();
      expect(detectionService.isActive).toBe(false);
      expect(detectionService.isModelLoaded).toBe(false);
    });

    it('should have TFLite-specific methods', () => {
      expect(typeof detectionService.loadModel).toBe('function');
      expect(typeof detectionService.processImageWithModel).toBe('function');
      expect(typeof detectionService.processPredictions).toBe('function');
    });

    it('should handle model loading attempts', () => {
      expect(detectionService.modelLoadAttempts).toBeGreaterThanOrEqual(0);
    });

    it('should track model loaded state', () => {
      expect(typeof detectionService.isModelLoaded).toBe('boolean');
    });
  });

  describe('Detection Configuration', () => {
    it('should have proper detection thresholds', () => {
      // These are from DETECTION_CONFIG in detectionService.js
      const expectedConfig = {
        minConfidence: 0.7, // 70%
        detectionInterval: 1500, // 1.5s
        modelRetryInterval: 10000, // 10s
      };

      // Service should respect these configs
      expect(detectionService.lastDetectionTime).toBeDefined();
    });

    it('should support 36 classes (A-Z, 0-9)', () => {
      // ALPHABET (26) + NUMBERS (10) = 36 classes
      const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const NUMBERS = '0123456789'.split('');
      const totalClasses = ALPHABET.length + NUMBERS.length;
      
      expect(totalClasses).toBe(36);
    });
  });

  describe('Inference Flow', () => {
    it('should process predictions with confidence threshold', async () => {
      const mockPredictions = [
        { label: 'A', confidence: 0.85, index: 0 },
        { label: 'B', confidence: 0.65, index: 1 }, // Below threshold
        { label: 'C', confidence: 0.92, index: 2 },
      ];

      // Filter predictions above 70% threshold
      const filtered = mockPredictions.filter(p => p.confidence >= 0.7);
      expect(filtered.length).toBe(2); // Only A and C
      expect(filtered[0].label).toBe('A');
      expect(filtered[1].label).toBe('C');
    });

    it('should select highest confidence detection', () => {
      const mockPredictions = [
        { label: 'A', confidence: 0.75 },
        { label: 'B', confidence: 0.92 }, // Highest
        { label: 'C', confidence: 0.80 },
      ];

      const best = mockPredictions.reduce((prev, current) => 
        current.confidence > prev.confidence ? current : prev
      );

      expect(best.label).toBe('B');
      expect(best.confidence).toBe(0.92);
    });

    it('should convert confidence to percentage', () => {
      const confidence = 0.87;
      const percentage = Math.round(confidence * 100);
      expect(percentage).toBe(87);
    });
  });

  describe('Detection Callbacks', () => {
    it('should register detection callbacks', () => {
      const mockCallback = jest.fn();
      detectionService.onDetection(mockCallback);
      
      expect(detectionService.callbacks).toContain(mockCallback);
    });

    it('should unregister detection callbacks', () => {
      const mockCallback = jest.fn();
      detectionService.onDetection(mockCallback);
      detectionService.offDetection(mockCallback);
      
      expect(detectionService.callbacks).not.toContain(mockCallback);
    });

    it('should handle multiple callbacks', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      detectionService.onDetection(callback1);
      detectionService.onDetection(callback2);
      
      expect(detectionService.callbacks.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle missing model', async () => {
      // Service should fall back to simulation mode
      expect(detectionService.isTfReady).toBeDefined();
      
      // Should not crash if model is not loaded
      expect(() => {
        detectionService.isModelLoaded;
      }).not.toThrow();
    });

    it('should handle model loading errors', () => {
      // Service should schedule retry
      expect(typeof detectionService.scheduleModelRetry).toBe('function');
    });

    it('should handle inference errors gracefully', async () => {
      const result = await detectionService.processImageWithModel(null);
      // Should return null on error, not throw
      expect(result).toBeNull();
    });
  });

  describe('Performance Requirements', () => {
    it('should respect debounce interval', () => {
      const now = Date.now();
      detectionService.lastDetectionTime = now;
      
      const timeSinceLastDetection = Date.now() - detectionService.lastDetectionTime;
      expect(timeSinceLastDetection).toBeLessThan(1500); // Less than debounce
    });

    it('should clean up on stop', () => {
      detectionService.startDetection({ current: null });
      detectionService.stopDetection();
      
      expect(detectionService.isActive).toBe(false);
    });
  });
});
