/**
 * Prediction smoothing utility
 * Maintains a queue of recent predictions and only updates when majority agrees
 * Reduces noise and false positives in real-time classification
 */
export class PredictionSmoother {
  constructor(queueLength = 5) {
    this.queueLength = queueLength;
    this.queue = [];
  }

  /**
   * Add a prediction to the queue and get the smoothed result
   * @param {Object} prediction - { label, confidence }
   * @param {number} confidenceThreshold - minimum confidence to count
   * @returns {Object} - { label, confidence, isStable }
   */
  addPrediction(prediction, confidenceThreshold = 0.5) {
    // Only add if confidence is above threshold
    if (prediction.confidence < confidenceThreshold) {
      this.queue = [];
      return { label: 'Detectando...', confidence: 0, isStable: false };
    }

    this.queue.push(prediction);
    if (this.queue.length > this.queueLength) {
      this.queue.shift();
    }

    // If we don't have enough predictions yet, return current
    if (this.queue.length < Math.ceil(this.queueLength * 0.6)) {
      return {
        label: prediction.label,
        confidence: prediction.confidence,
        isStable: false
      };
    }

    // Count votes for each label in the queue
    const votes = {};
    let totalConfidence = 0;
    this.queue.forEach(pred => {
      if (!votes[pred.label]) votes[pred.label] = { count: 0, totalConf: 0 };
      votes[pred.label].count++;
      votes[pred.label].totalConf += pred.confidence;
      totalConfidence += pred.confidence;
    });

    // Find the label with most votes
    let bestLabel = null;
    let maxVotes = 0;
    let bestConfidence = 0;

    Object.entries(votes).forEach(([label, data]) => {
      if (data.count > maxVotes) {
        maxVotes = data.count;
        bestLabel = label;
        bestConfidence = data.totalConf / data.count;
      }
    });

    // Label is stable if it appears in 60%+ of recent predictions
    const stabilityThreshold = Math.ceil(this.queue.length * 0.6);
    const isStable = maxVotes >= stabilityThreshold;

    return {
      label: bestLabel || prediction.label,
      confidence: bestConfidence,
      isStable,
      votes: maxVotes,
      total: this.queue.length
    };
  }

  reset() {
    this.queue = [];
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export default PredictionSmoother;
