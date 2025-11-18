/**
 * Debounce function - delays function execution until after N ms of inactivity
 * Useful for TTS to avoid speaking multiple times rapidly
 */
export function debounce(func, delayMs) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delayMs);
  };
}

/**
 * Throttle function - limits function execution to once per N ms
 * Useful for predictions to avoid processing too frequently
 */
export function throttle(func, delayMs) {
  let lastCallTime = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCallTime >= delayMs) {
      lastCallTime = now;
      return func(...args);
    }
  };
}

export default { debounce, throttle };
