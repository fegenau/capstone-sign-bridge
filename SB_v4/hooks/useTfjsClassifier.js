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
  const [error, setError] = useState(null);
  const modelRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        console.log('[useTfjsClassifier] Iniciando carga de modelo y labels...');

        // Cargar labels - intenta múltiples rutas
        let res, data;
        const labelPaths = [labelsUrl, './labels.json', '../public/labels.json', 'labels.json'];

        for (const path of labelPaths) {
          try {
            res = await fetch(path);
            if (res.ok) {
              data = await res.json();
              const classes = Array.isArray(data) ? data : data.classes;
              if (mounted) {
                setLabels(classes || []);
                console.log('[useTfjsClassifier] Labels cargados desde:', path, `(${classes?.length} clases)`);
              }
              break;
            }
          } catch (e) {
            console.debug(`[useTfjsClassifier] No se encontraron labels en ${path}`);
          }
        }

        // Cargar modelo - intenta múltiples rutas
        const modelPaths = [modelUrl, './model/model.json', '../public/model/model.json', 'model/model.json'];
        let modelLoaded = false;

        for (const path of modelPaths) {
          try {
            console.log(`[useTfjsClassifier] Intentando cargar modelo desde: ${path}`);
            const model = await tf.loadLayersModel(`file://${path}` === `file://${path}` ? path : path);
            modelRef.current = model;
            modelLoaded = true;
            if (mounted) {
              setReady(true);
              setError(null);
              console.log('[useTfjsClassifier] Modelo cargado exitosamente desde:', path);
            }
            break;
          } catch (e) {
            console.warn(`[useTfjsClassifier] Error cargando desde ${path}:`, e.message);
          }
        }

        if (!modelLoaded && mounted) {
          const errorMsg = 'No se pudo cargar el modelo. Verifica que los archivos estén en /public/model/';
          setError(errorMsg);
          console.error('[useTfjsClassifier] Rutas intentadas:', modelPaths);
          console.error('[useTfjsClassifier] Error final:', errorMsg);
        }
      } catch (e) {
        console.error('[useTfjsClassifier] Error al cargar:', e);
        if (mounted) setError(e.message);
      }
    })();
    return () => { mounted = false; };
  }, [labelsUrl, modelUrl]);

  const classify = useCallback(async (sequence24x126) => {
    if (!ready || !modelRef.current) {
      console.warn('[useTfjsClassifier] Modelo no está listo. ready:', ready, 'model:', !!modelRef.current);
      return { label: 'Cargando modelo…', confidence: 0 };
    }
    // sequence24x126: Array(24) de Array(126)
    try {
      console.log('[useTfjsClassifier] 🔄 Iniciando clasificación...');
      console.log('[useTfjsClassifier] Input shape:', [sequence24x126.length, sequence24x126[0]?.length]);

      const input = tf.tensor(sequence24x126).expandDims(0); // [1,24,126]
      console.log('[useTfjsClassifier] Tensor shape después expandDims:', input.shape);

      const logits = modelRef.current.predict(input);
      console.log('[useTfjsClassifier] Logits shape:', logits.shape);
      console.log('[useTfjsClassifier] Logits dtype:', logits.dtype);

      const probs = await logits.softmax().data();
      console.log('[useTfjsClassifier] Softmax completado. Total de clases:', probs.length);

      input.dispose();
      if (logits.dispose) logits.dispose();

      let bestI = 0;
      let bestP = 0;
      const topPredictions = [];

      probs.forEach((p, i) => {
        topPredictions.push({ idx: i, confidence: p });
        if (p > bestP) {
          bestP = p;
          bestI = i;
        }
      });

      // Obtener top 3 predicciones para debug
      topPredictions.sort((a, b) => b.confidence - a.confidence);
      const top3 = topPredictions.slice(0, 3);

      const label = labels[bestI] || `Clase ${bestI}`;
      console.log('[useTfjsClassifier] ✅ Top 3 predicciones:', top3.map(p => ({
        label: labels[p.idx] || `Clase ${p.idx}`,
        confidence: (p.confidence * 100).toFixed(2) + '%'
      })));
      console.log('[useTfjsClassifier] 🎯 Predicción final:', { label, confidence: (bestP * 100).toFixed(2) + '%' });

      return { label, confidence: bestP };
    } catch (e) {
      console.error('[useTfjsClassifier] ❌ Error durante clasificación:', e);
      console.error('[useTfjsClassifier] Stack trace:', e.stack);
      return { label: 'Error de inferencia', confidence: 0 };
    }
  }, [ready, labels]);

  return { ready, labels, classify, error };
}

export default useTfjsClassifier;
