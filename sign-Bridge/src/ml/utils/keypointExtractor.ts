/*
 * keypointExtractor.ts
 * Funciones utilitarias para transformar detecciones MediaPipe a estructuras para el modelo.
 */

export const FRAME_FEATURES = 126; // 21 landmarks * 3 coords * 2 manos
export const LANDMARKS_PER_HAND = 21;

export interface Landmark3D { x: number; y: number; z: number; }
export interface HandDetection { landmarks: Landmark3D[] }

export interface TwoHandDetection {
  left?: HandDetection | null;
  right?: HandDetection | null;
}

/**
 * Extrae 63 features (21*3) de una mano
 */
export function extractHandFeatures(hand?: HandDetection | null): number[] {
  const out: number[] = new Array(LANDMARKS_PER_HAND * 3).fill(0);
  if (!hand || !hand.landmarks) return out;
  let i = 0;
  for (const lm of hand.landmarks.slice(0, LANDMARKS_PER_HAND)) {
    out[i++] = clamp01(lm.x);
    out[i++] = clamp01(lm.y);
    out[i++] = clamp01(lm.z ?? 0);
  }
  return out;
}

/**
 * Combina mano izquierda y derecha en 126 features
 */
export function combineTwoHands(det: TwoHandDetection): number[] {
  const left = extractHandFeatures(det.left);
  const right = extractHandFeatures(det.right);
  return [...left, ...right];
}

export function clamp01(v: number): number { return Math.max(0, Math.min(1, v)); }

/**
 * Convierte dos manos a tensor-ready flat array length 126 (already normalized 0..1)
 */
export function toModelFeatures(det: TwoHandDetection): number[] {
  return combineTwoHands(det);
}
