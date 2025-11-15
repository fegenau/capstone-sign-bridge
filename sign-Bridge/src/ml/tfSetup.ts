/*
 * tfSetup.ts
 * Inicialización de TensorFlow.js para React Native / Web
 */
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
// Intentar cargar backend RN para acelerar en dispositivos
let rnBackendLoaded = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@tensorflow/tfjs-react-native');
  rnBackendLoaded = true;
} catch {/* ignore */}

export interface TFInitResult { backend: string; backendsAvailable: string[] }
let initialized = false;

export async function initTF(preferredBackend: 'rn-webgl' | 'webgl' | 'wasm' | 'cpu' = 'rn-webgl'): Promise<TFInitResult> {
  if (initialized) {
    return { backend: tf.getBackend(), backendsAvailable: Object.keys((tf as any).engine().registry) };
  }
  await tf.ready();

  const candidates: Array<'rn-webgl' | 'webgl' | 'wasm' | 'cpu'> = [];
  if (rnBackendLoaded) candidates.push('rn-webgl');
  candidates.push('webgl', 'wasm', 'cpu');

  let selected = preferredBackend;
  if (preferredBackend === 'rn-webgl' && !rnBackendLoaded) selected = 'webgl';

  try {
    await tf.setBackend(selected);
  } catch {
    for (const b of candidates) {
      try { await tf.setBackend(b); selected = b; break; } catch {/* continue */}
    }
  }

  initialized = true;
  return { backend: tf.getBackend(), backendsAvailable: Object.keys((tf as any).engine().registry) };
}

export function isTFInitialized() { return initialized; }
