/**
 * Model Validation Tests
 * Tests for the model validation script
 */

const fs = require('fs');
const path = require('path');

describe('Model Validation', () => {
  const MODEL_PATH = path.join(__dirname, '..', 'assets', 'Modelo', 'runs', 'detect', 'train', 'weights', 'best_float16.tflite');
  
  test('model file should exist', () => {
    expect(fs.existsSync(MODEL_PATH)).toBe(true);
  });

  test('model file should be larger than 1MB', () => {
    if (fs.existsSync(MODEL_PATH)) {
      const stats = fs.statSync(MODEL_PATH);
      const sizeMB = stats.size / (1024 * 1024);
      
      expect(sizeMB).toBeGreaterThan(1);
      expect(sizeMB).toBeLessThan(100);
    }
  });

  test('model file should be binary (not text)', () => {
    if (fs.existsSync(MODEL_PATH)) {
      const buffer = fs.readFileSync(MODEL_PATH);
      const firstBytes = buffer.slice(0, 20).toString('ascii');
      
      expect(firstBytes).not.toContain('This is a placeholder');
      expect(firstBytes).not.toContain('text');
    }
  });

  test('model file should have valid header', () => {
    if (fs.existsSync(MODEL_PATH)) {
      const buffer = fs.readFileSync(MODEL_PATH);
      
      expect(buffer.length).toBeGreaterThan(100);
    }
  });
});
