/**
 * utils/services/cameraDebugger.js
 *
 * Camera debugging and troubleshooting utilities
 * Comprehensive logging for black camera preview issues
 *
 * Features:
 * - Camera state tracking
 * - Frame capture validation
 * - Performance metrics
 * - Health checks
 */

class CameraDebugger {
  constructor() {
    this.logs = [];
    this.metrics = {
      framesCaptured: 0,
      framesProcessed: 0,
      frameDrops: 0,
      averageFrameTime: 0,
      cameraInitTime: 0,
      lastFrameTime: 0,
    };
    this.cameraState = {
      permissionGranted: false,
      cameraReady: false,
      isRecording: false,
      hasError: false,
      errorMessage: null,
    };
    this.startTime = Date.now();
  }

  /**
   * Log message with timestamp
   */
  log(message, level = 'INFO', data = null) {
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(2);
    const logEntry = {
      timestamp: new Date().toISOString(),
      elapsed: `${elapsed}s`,
      level,
      message,
      data,
    };

    const formattedLog = `[${logEntry.elapsed}] [${level}] ${message}`;
    if (data) {
      formattedLog += ` ${JSON.stringify(data)}`;
    }

    this.logs.push(formattedLog);

    // Also log to console
    console.log(formattedLog);

    // Keep only last 100 logs
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    return logEntry;
  }

  /**
   * Log camera initialization event
   */
  logCameraInitStart() {
    this.log('Camera initialization started', 'INFO');
    this.cameraState.cameraReady = false;
  }

  /**
   * Log camera ready event
   */
  logCameraReady() {
    this.cameraState.cameraReady = true;
    this.cameraState.hasError = false;
    const initTime = Date.now() - this.startTime;
    this.metrics.cameraInitTime = initTime;
    this.log('✅ Camera is ready', 'SUCCESS', { initTimeMs: initTime });
  }

  /**
   * Log frame capture attempt
   */
  logFrameCapture(frameNumber, success = true, frameSizeBytes = null) {
    if (success) {
      this.metrics.framesCaptured++;
      this.log(`📸 Frame ${frameNumber} captured`, 'DEBUG', {
        totalFrames: this.metrics.framesCaptured,
        sizeBytes: frameSizeBytes,
      });
    } else {
      this.metrics.frameDrops++;
      this.log(`⚠️ Frame ${frameNumber} dropped`, 'WARN', {
        totalDrops: this.metrics.frameDrops,
      });
    }
  }

  /**
   * Log frame processing
   */
  logFrameProcess(frameNumber, processingTimeMs, success = true) {
    if (success) {
      this.metrics.framesProcessed++;
      this.metrics.lastFrameTime = processingTimeMs;

      // Calculate moving average
      const totalTime =
        this.metrics.averageFrameTime * (this.metrics.framesProcessed - 1) +
        processingTimeMs;
      this.metrics.averageFrameTime = totalTime / this.metrics.framesProcessed;

      if (processingTimeMs > 50) {
        this.log(`⚠️ Slow frame processing: ${processingTimeMs}ms`, 'WARN', {
          frameNumber,
          targetMs: 33,
        });
      }
    } else {
      this.log(`❌ Frame ${frameNumber} processing failed`, 'ERROR', {
        timeMs: processingTimeMs,
      });
    }
  }

  /**
   * Log camera error
   */
  logCameraError(error) {
    this.cameraState.hasError = true;
    this.cameraState.errorMessage = error.message;
    this.log(`❌ Camera error: ${error.message}`, 'ERROR', {
      code: error.code,
      errorType: error.name,
    });
  }

  /**
   * Log permission status
   */
  logPermissionStatus(granted, permissionType = 'camera') {
    this.cameraState.permissionGranted = granted;
    const status = granted ? '✅ GRANTED' : '❌ DENIED';
    this.log(`${permissionType} permission: ${status}`, 'INFO');
  }

  /**
   * Log camera dimensions and format
   */
  logCameraFormat(width, height, format, frameRate) {
    this.log('Camera format detected', 'INFO', {
      dimensions: `${width}x${height}`,
      format,
      frameRate: `${frameRate} FPS`,
    });
  }

  /**
   * Log retry attempt
   */
  logRetry(attemptNumber, reason = '') {
    this.log(`🔄 Retry attempt ${attemptNumber}`, 'WARN', {
      reason,
      delayMs: 500 * Math.pow(2, attemptNumber - 1), // Exponential backoff
    });
  }

  /**
   * Health check - validate camera is working
   */
  healthCheck() {
    const health = {
      isCameraReady: this.cameraState.cameraReady,
      hasError: this.cameraState.hasError,
      permissionGranted: this.cameraState.permissionGranted,
      framesCapturing: this.metrics.framesCaptured > 0,
      dropRate: this.metrics.framesCaptured > 0
        ? ((this.metrics.frameDrops / this.metrics.framesCaptured) * 100).toFixed(2) + '%'
        : 'N/A',
      averageFrameTime: this.metrics.averageFrameTime.toFixed(2) + 'ms',
      performance: this.metrics.averageFrameTime < 33 ? '✅ GOOD' : '⚠️ SLOW',
    };

    this.log('📊 Health Check Report', 'INFO', health);
    return health;
  }

  /**
   * Get detailed metrics report
   */
  getMetricsReport() {
    return {
      ...this.metrics,
      health: this.healthCheck(),
      state: this.cameraState,
      logCount: this.logs.length,
    };
  }

  /**
   * Get all logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Get last N logs
   */
  getRecentLogs(count = 20) {
    return this.logs.slice(-count);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
    this.log('Logs cleared', 'INFO');
  }

  /**
   * Export logs for debugging
   */
  exportLogsAsText() {
    return `Camera Debug Report - ${new Date().toISOString()}\n\n` +
      `Metrics:\n${JSON.stringify(this.metrics, null, 2)}\n\n` +
      `State:\n${JSON.stringify(this.cameraState, null, 2)}\n\n` +
      `Logs:\n${this.logs.join('\n')}`;
  }

  /**
   * Reset debugger
   */
  reset() {
    this.logs = [];
    this.metrics = {
      framesCaptured: 0,
      framesProcessed: 0,
      frameDrops: 0,
      averageFrameTime: 0,
      cameraInitTime: 0,
      lastFrameTime: 0,
    };
    this.cameraState = {
      permissionGranted: false,
      cameraReady: false,
      isRecording: false,
      hasError: false,
      errorMessage: null,
    };
    this.startTime = Date.now();
    this.log('Debugger reset', 'INFO');
  }
}

// Export singleton instance
export const cameraDebugger = new CameraDebugger();

export default CameraDebugger;
