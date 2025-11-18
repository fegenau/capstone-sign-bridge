import * as tf from '@tensorflow/tfjs';

// Some Keras conversions serialize regularizers as class_name 'L2'/'L1'.
// During inference they are unused, but TFJS still needs the class registered
// to successfully deserialize the model. We register minimal no-op shims.

class L2 extends tf.serialization.Serializable {
  static className = 'L2';
  constructor(config = {}) { super(); this.l2 = config.l2 ?? 0; }
  getConfig() { return { l2: this.l2 }; }
  // No-op for inference; return 0 loss.
  apply() { return tf.scalar(0); }
}

class L1 extends tf.serialization.Serializable {
  static className = 'L1';
  constructor(config = {}) { super(); this.l1 = config.l1 ?? config.l ?? 0; }
  getConfig() { return { l1: this.l1 }; }
  apply() { return tf.scalar(0); }
}

try { tf.serialization.registerClass(L2); } catch {}
try { tf.serialization.registerClass(L1); } catch {}
