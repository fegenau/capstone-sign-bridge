/*
 * useSignMovementRecognition.ts
 * Hook que integra MediaPipe + clasificador LSTM.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { getClassifier } from '../ml/signMovementClassifier';
import { toModelFeatures, TwoHandDetection } from '../ml/utils/keypointExtractor';

export interface UseSignMovementRecognitionOptions {
  smoothWindow?: number;
  minConfidence?: number;
  onPrediction?: (prediction: { label: string; confidence: number }) => void;
}

export interface RecognitionState {
  prediction: string | null;
  confidence: number;
  isProcessing: boolean;
  frameCount: number;
}

export function useSignMovementRecognition(options: UseSignMovementRecognitionOptions = {}) {
  const { smoothWindow = 8, minConfidence = 0.5, onPrediction } = options;
  const [state, setState] = useState<RecognitionState>({ prediction: null, confidence: 0, isProcessing: false, frameCount: 0 });
  const rafRef = useRef<number | null>(null);
  const classifier = getClassifier();
  const lastPredictionRef = useRef<string | null>(null);

  // Inicializar modelo
  useEffect(() => {
    let mounted = true;
    classifier.load().catch(err => console.error('[Recognition] Error cargando modelo', err));
    return () => { mounted = false; if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [classifier]);

  const pushDetection = useCallback((hands: TwoHandDetection) => {
    const features = toModelFeatures(hands);
    classifier.pushFrame(features);
    setState(s => ({ ...s, frameCount: Math.min(24, s.frameCount + 1) }));
  }, [classifier]);

  const predictLoop = useCallback(async () => {
    if (classifier.canPredict()) {
      const result = await classifier.predict();
      if (result && result.confidence >= minConfidence) {
        if (result.label !== lastPredictionRef.current) {
          lastPredictionRef.current = result.label;
          onPrediction?.({ label: result.label, confidence: result.confidence });
        }
        setState(s => ({ ...s, prediction: result.label, confidence: result.confidence }));
      }
    }
    rafRef.current = requestAnimationFrame(predictLoop);
  }, [classifier, minConfidence, onPrediction]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(predictLoop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [predictLoop]);

  return { ...state, pushDetection };
}

export default useSignMovementRecognition;
