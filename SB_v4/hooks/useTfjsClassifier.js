import { useEffect, useRef, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import '../utils/tfjs-compat';

/**
 * useTfjsClassifier
 * Carga un modelo TFJS (layers) exportado desde Keras y clasifica secuencias de 24 frames x 126 features.
 * - Espera input shape: [batch, 24, 126]
 * - Normalización: ya aplicada en el hook de MediaPipe
 * - Labels: se cargan desde /labels.json o prop.
 */
export function useTfjsClassifier({ labelsUrl = '/labels.json', modelUrl = '/model/model.json' } = {}) {
  const [ready, setReady] = useState(false);
  const [labels, setLabels] = useState([]);
  const modelRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Cargar labels
        const res = await fetch(labelsUrl);
        const data = await res.json();
        const classes = Array.isArray(data) ? data : data.classes;
        if (mounted) setLabels(classes || []);
        // Cargar modelo
        const model = await tf.loadLayersModel(modelUrl);
        modelRef.current = model;
        if (mounted) setReady(true);
      } catch (e) {
        console.warn('[useTfjsClassifier] no se pudo cargar modelo/labels aún:', e.message);
      }
    })();
    return () => { mounted = false; };
  }, [labelsUrl, modelUrl]);

  const classify = useCallback(async (sequence24x126) => {
    if (!ready || !modelRef.current) return { label: 'Cargando modelo…', confidence: 0 };
    // sequence24x126: Array(24) de Array(126)
    try {
      const input = tf.tensor(sequence24x126).expandDims(0); // [1,24,126]
      const logits = modelRef.current.predict(input);
      const probs = (await logits.softmax().data());
      input.dispose(); if (logits.dispose) logits.dispose();
      let bestI = 0; let bestP = 0;
      probs.forEach((p, i) => { if (p > bestP) { bestP = p; bestI = i; } });
      const label = labels[bestI] || `Clase ${bestI}`;
      return { label, confidence: bestP };
    } catch (e) {
      return { label: 'Error de inferencia', confidence: 0 };
    }
  }, [ready, labels]);

  return { ready, labels, classify };
}

export default useTfjsClassifier;
