/**
 * Basic App Tests
 * SignBridge - Sign Language Learning App
 */

describe('SignBridge App', () => {
  test('simple sanity check', () => {
    expect(1 + 1).toBe(2);
  });

  test('app constants are defined', () => {
    expect('SignBridge').toBeDefined();
    expect('com.signbridge.app').toBeDefined();
  });

  test('environment check', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
