/*
 * signMovementClassifier.ts
 * Carga y gestión de inferencia del modelo LSTM de señas.
 */
import * as tf from '@tensorflow/tfjs';
import { Platform } from 'react-native';
import { initTF } from './tfSetup';
import { FRAME_FEATURES } from './utils/keypointExtractor';

export interface PredictionResult {
  label: string;
  confidence: number;
  raw: number[]; // vector de probabilidades
}

interface SmootherEntry { label: string; confidence: number; raw: number[] }

export class SignMovementClassifier {
  private model: tf.LayersModel | null = null;
  private labels: string[] = [];
  private frameBuffer: number[][] = [];
  private readonly maxFrames = 24;
  private smootherWindow: SmootherEntry[] = [];
  private readonly smoothSize = 8;
  private loadingPromise: Promise<void> | null = null;

  constructor(private readonly assetBase: string = '../../assets/ml') {}

  async load(): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = this._loadInternal();
    return this.loadingPromise;
  }

  private async _loadInternal(): Promise<void> {
    await initTF();
    await tf.ready();

    // Carga diferenciada web vs RN
    try {
      if (Platform.OS === 'web') {
        // En web, Metro sirve los assets estáticamente en /assets/ml/
        // Usa rutas absolutas que Metro maneja correctamente
        this.model = await tf.loadLayersModel('/assets/ml/model.json');
        console.log('[Classifier] Modelo cargado desde /assets/ml/model.json');
      } else {
        // En React Native, usar bundleResourceIO
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { bundleResourceIO } = require('@tensorflow/tfjs-react-native');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const modelJson = require('../../assets/ml/model.json');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const weightBin = require('../../assets/ml/group1-shard1of1.bin');
        this.model = await tf.loadLayersModel(bundleResourceIO(modelJson, weightBin));
        console.log('[Classifier] Modelo cargado para React Native');
      }
    } catch (e) {
      console.error('[Classifier] Error cargando modelo', e);
      throw e;
    }

    // Cargar labels
    try {
      // Metro permite require de JSON
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const lbl = require('../../assets/ml/label_encoder.json');
      this.labels = (lbl.classes || lbl) as string[];
    } catch {
      const labelsResp = await fetch(`${this.assetBase}/label_encoder.json`).catch(() => null);
      if (labelsResp) {
        try {
          const json = await labelsResp.json();
          this.labels = json.classes || json;
        } catch {/* ignore */}
      }
    }
    if (!this.labels || this.labels.length === 0) {
      throw new Error('Labels no disponibles');
    }
  }

  pushFrame(features126: number[]): void {
    if (features126.length !== FRAME_FEATURES) return; // ignora frame inválido
    if (this.frameBuffer.length >= this.maxFrames) this.frameBuffer.shift();
    this.frameBuffer.push(features126);
  }

  canPredict(): boolean {
    return this.frameBuffer.length === this.maxFrames && !!this.model;
  }

  clearBuffer(): void { this.frameBuffer = []; }

  async predict(): Promise<PredictionResult | null> {
    if (!this.canPredict() || !this.model) return null;

    // Crear tensor [1, 24, 126]
    const input = tf.tensor3d([this.frameBuffer], [1, this.maxFrames, FRAME_FEATURES]);
    const logits = tf.tidy(() => this.model!.predict(input) as tf.Tensor);
    const probs = Array.from(await logits.data());
    tf.dispose([input, logits]);

    if (probs.length !== this.labels.length) {
      return null;
    }

    // Máxima probabilidad
    let maxIdx = 0; let maxVal = probs[0];
    for (let i = 1; i < probs.length; i++) { if (probs[i] > maxVal) { maxVal = probs[i]; maxIdx = i; } }
    const label = this.labels[maxIdx];

    // Actualizar suavizado
    this.smootherWindow.push({ label, confidence: maxVal, raw: probs });
    if (this.smootherWindow.length > this.smoothSize) this.smootherWindow.shift();

    const smoothed = this.getSmoothed();
    return smoothed;
  }

  private getSmoothed(): PredictionResult {
    const aggregate = new Map<string, { sum: number; raw: number[] }>();
    for (const entry of this.smootherWindow) {
      const cur = aggregate.get(entry.label);
      if (!cur) aggregate.set(entry.label, { sum: entry.confidence, raw: entry.raw });
      else cur.sum += entry.confidence;
    }
    let bestLabel = ''; let bestScore = -1; let bestRaw: number[] = [];
    for (const [label, v] of aggregate.entries()) {
      const avg = v.sum / this.smootherWindow.length;
      if (avg > bestScore) { bestScore = avg; bestLabel = label; bestRaw = v.raw; }
    }
    return { label: bestLabel, confidence: bestScore, raw: bestRaw };
  }
}

// Singleton helper
let _instance: SignMovementClassifier | null = null;
export function getClassifier(): SignMovementClassifier {
  if (!_instance) _instance = new SignMovementClassifier();
  return _instance;
}
