/**
 * Detection Service Tests
 * Tests for the TFLite model integration and detection service
 */

import { DetectionService, generateRandomDetection, simulateDetection } from '../utils/services/detectionService';

describe('DetectionService', () => {
  describe('generateRandomDetection', () => {
    test('should generate a valid detection object', () => {
      const detection = generateRandomDetection();
      
      expect(detection).toHaveProperty('letter');
      expect(detection).toHaveProperty('confidence');
      expect(typeof detection.letter).toBe('string');
      expect(typeof detection.confidence).toBe('number');
      expect(detection.confidence).toBeGreaterThanOrEqual(30);
      expect(detection.confidence).toBeLessThanOrEqual(95);
    });

    test('should generate letters from A-Z or numbers 0-9', () => {
      const detection = generateRandomDetection();
      const validSymbols = /^[A-Z0-9]$/;
      
      expect(detection.letter).toMatch(validSymbols);
    });
  });

  describe('simulateDetection', () => {
    test('should resolve with detection or null', async () => {
      const result = await simulateDetection();
      
      if (result !== null) {
        expect(result).toHaveProperty('letter');
        expect(result).toHaveProperty('confidence');
      } else {
        expect(result).toBeNull();
      }
    }, 10000);
  });

  describe('DetectionService class', () => {
    let service;

    beforeEach(() => {
      service = new DetectionService();
    });

    test('should initialize with correct default state', () => {
      expect(service.isActive).toBe(false);
      expect(service.isModelLoaded).toBe(false);
      expect(service.callbacks).toEqual([]);
    });

    test('should register callbacks', () => {
      const mockCallback = jest.fn();
      service.onDetection(mockCallback);
      
      expect(service.callbacks).toContain(mockCallback);
    });

    test('should unregister callbacks', () => {
      const mockCallback = jest.fn();
      service.onDetection(mockCallback);
      service.offDetection(mockCallback);
      
      expect(service.callbacks).not.toContain(mockCallback);
    });
  });
});
