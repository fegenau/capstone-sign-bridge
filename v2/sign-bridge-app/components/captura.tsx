import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Platform, StyleSheet, Text, View } from "react-native";
// NOTA: Requiere instalar @tensorflow/tfjs y opcionalmente @tensorflow/tfjs-react-native
// npm i @tensorflow/tfjs
// Importes dinámicos para evitar fallos si no están instalados aún
let tf: any = null;
try { tf = require("@tensorflow/tfjs"); } catch {}
let cameraWithTensors: any = null;
try { cameraWithTensors = require("@tensorflow/tfjs-react-native").cameraWithTensors; } catch {}
let Asset: any = null;
try { Asset = require("expo-asset").Asset; } catch {}
let FileSystem: any = null;
try { FileSystem = require("expo-file-system"); } catch {}
import { loadLabelsFromYaml } from "../utils/labels";

const TensorCamera = cameraWithTensors ? cameraWithTensors(CameraView as any) : null;
const AnyCameraView: any = CameraView as any;

type Prediction = {
  label: string;
  confidence?: number;
};

export default function Captura() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isTfReady, setIsTfReady] = useState(false);
  const [usingTflite, setUsingTflite] = useState(false);
  const tfliteModelRef = useRef(null as any);
  const [lastPred, setLastPred] = useState(null as any);
  const rafRef = useRef(null as any);
  const modelRef = useRef(null as any);
  const [labels, setLabels] = useState([] as any);

  const textureDims = useMemo(
    () =>
      Platform.OS === "ios"
        ? { width: 1080, height: 1920 }
        : { width: 1600, height: 1200 },
    []
  );

  // Inicializar TFJS y (opcional) TFLite nativo si está disponible
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Inicializar backend de tfjs para React Native
        const tfReactNative = (() => { try { return require("@tensorflow/tfjs-react-native"); } catch { return null; } })();
        if (tfReactNative?.bundleResourceIO) {
          // registrar backend rn-webgl
          await tfReactNative?.setBackend?.("rn-webgl").catch(() => {});
        }
        if (tf?.ready) await tf.ready();
        if (!mounted) return;
        setIsTfReady(true);

        // Cargar etiquetas desde metadata.yaml
        try {
          const lbls = await loadLabelsFromYaml();
          if (mounted) setLabels(lbls);
        } catch {}

        // Intentar cargar modelo TFJS si existe en assets/model/model.json
        try {
          if (tf?.loadGraphModel && Asset) {
            const modelAsset = Asset.fromModule(require("../assets/model/model.json"));
            await modelAsset.downloadAsync();
            const uri = modelAsset.localUri || modelAsset.uri;
            const handler = { load: () => fetch(uri).then(r => r.json()), loadWeights: null } as any;
            // En Expo, lo más fiable es servirlo vía packager (require resuelve a url). Si no, se puede usar IOHandler custom.
            const model = await tf.loadGraphModel(uri);
            modelRef.current = model;
            console.log("[Captura] Modelo TFJS cargado", uri);
          }
        } catch (e) {
          console.log("[Captura] Modelo TFJS no encontrado (usando stub):", (e as any)?.message || e);
        }
      } catch (e) {
        console.warn("No se pudo inicializar tfjs:", (e as any)?.message || e);
      }

      // Intentar cargar TFLite nativo si la lib existe (solo iOS/Android)
      if (Platform.OS === "ios" || Platform.OS === "android") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const fastTflite = require("react-native-fast-tflite");
          const { TFLiteModel } = fastTflite || {};
          if (TFLiteModel) {
            // Cargar el modelo desde assets usando Expo Asset
            const asset = Asset?.fromModule(
              // Ruta relativa a este archivo hacia assets/Modelo
              require("../assets/Modelo/best_float32.tflite")
            );
            if (asset) {
              await asset.downloadAsync();
              const fileUri = asset.localUri || asset.uri;
              tfliteModelRef.current = await TFLiteModel.createFromFile(fileUri);
              setUsingTflite(true);
              console.log("[Captura] Modelo TFLite cargado desde:", fileUri);
            } else {
              console.warn("expo-asset no disponible; no se puede cargar .tflite desde assets");
            }
          }
        } catch (e) {
          console.log(
            "[Captura] TFLite nativo no disponible (se usará tfjs o simulación):",
            (e as any)?.message || e
          );
        }
      }
    })();
    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const predictWithTfjs = useCallback(async (imageTensor: any) => {
    if (!tf) {
      setLastPred({ label: `tfjs no disponible` });
      return;
    }
    // Preprocesado: [h,w,3] -> float32 [0,1], resize 224x224
    let input = imageTensor as any;
    try {
      if (tf.image?.resizeBilinear) {
        input = tf.image.resizeBilinear(input, [224, 224]);
      }
      input = tf.div(input, tf.scalar(255));
      input = tf.expandDims(input, 0); // [1,224,224,3]

      if (modelRef.current?.executeAsync) {
        const out = (await modelRef.current.executeAsync(input)) as any;
        // Asumimos salida [1, num_classes]
        const logits = Array.isArray(out) ? out[0] : out;
        const data = await logits.data();
        let bestIdx = 0;
        for (let i = 1; i < data.length; i++) if (data[i] > data[bestIdx]) bestIdx = i;
        const label = labels[bestIdx] ?? `clase_${bestIdx}`;
        setLastPred({ label });
        if (Array.isArray(out)) out.forEach((t: any) => t?.dispose?.()); else logits?.dispose?.();
      } else {
        // Stub: sin modelo, mostrar media como antes
        const mean = tf.mean(imageTensor);
        const d = await mean.data();
        const val = d && d.length ? d[0] : 0;
        setLastPred({ label: `tfjs: ${Number(val).toFixed(3)}` });
        mean?.dispose?.();
      }
    } catch (e) {
      console.error("predictWithTfjs error:", (e as any)?.message || e);
    } finally {
      try { input?.dispose?.(); } catch {}
    }
  }, [labels]);

  const predictWithTflite = useCallback(async (_imageTensor: any) => {
    // TODO: implementar preprocesamiento -> this.tfliteModel.run(input) -> post-procesado YOLO
    // Por ahora sólo marcamos que se llamó al backend TFLite
    setLastPred({ label: "tflite: llamada (stub)" });
  }, []);

  const handleCameraStream = useCallback(
    (images: any) => {
      const loop = async () => {
        const next = images.next();
        if (!next || next.done) {
          rafRef.current = requestAnimationFrame(loop);
          return;
        }
        const imageTensor = next.value as any;
        try {
          if (usingTflite && tfliteModelRef.current) {
            await predictWithTflite(imageTensor);
          } else if (isTfReady && tf) {
            await predictWithTfjs(imageTensor);
          }
        } catch (e) {
          console.error("Error en predicción:", (e as any)?.message || e);
        } finally {
          try { tf?.dispose(imageTensor); } catch {}
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
    },
    [isTfReady, usingTflite, predictWithTfjs, predictWithTflite]
  );

  // Pedir permisos cámara
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text>Solicitando permiso de cámara…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {TensorCamera ? (
        <TensorCamera
          style={styles.camera}
          facing="back"
          resizeHeight={224}
          resizeWidth={224}
          resizeDepth={3}
          onReady={handleCameraStream}
          autorender={true}
          useCustomShadersToResize={false}
        />
      ) : (
        <AnyCameraView style={styles.camera} facing="back" />
      )}
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.status}>
          {!TensorCamera
            ? "cameraWithTensors no disponible; usando cámara básica"
            : usingTflite
            ? "Modelo: TFLite (stub)"
            : isTfReady
            ? "Modelo: tfjs (stub)"
            : "Modelo: inicializando…"}
        </Text>
        {lastPred && (
          <Text style={styles.pred}>{`Predicción: ${lastPred.label}`}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  status: { color: "#fff" },
  pred: { color: "#00FF62", marginTop: 6, fontWeight: "600" },
});
