import { useEffect, useRef, useState, useCallback } from 'react';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

const useMediaPipeDetection = ({ 
  isActive, 
  onHandDetection, 
  debug = false,
  minDetectionConfidence = 0.3, // Bajamos el umbral para mejor detección
  minTrackingConfidence = 0.3,   // Bajamos el umbral de tracking
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [handCount, setHandCount] = useState(0);
  const [processedFrames, setProcessedFrames] = useState(0);
  const [lastProcessTime, setLastProcessTime] = useState(0);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const handsRef = useRef(null);
  const cameraRef = useRef(null);
  const isProcessingRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastValidLandmarksRef = useRef(null);

  // Función mejorada para extraer keypoints con validación
  const extractKeypoints = useCallback((landmarks) => {
    if (!landmarks || landmarks.length === 0) {
      console.warn('[MediaPipe] No landmarks detectados');
      return null;
    }

    try {
      // Extraer los 63 valores (21 landmarks x 3 coordenadas)
      const keypoints = landmarks.flatMap(landmark => [
        landmark.x || 0,
        landmark.y || 0,
        landmark.z || 0
      ]);

      // Validar que tenemos exactamente 63 valores
      if (keypoints.length !== 63) {
        console.error('[MediaPipe] Keypoints incorrectos:', keypoints.length);
        return null;
      }

      // Verificar que no todos los valores sean 0
      const hasValidData = keypoints.some(val => val !== 0 && !isNaN(val));
      
      if (!hasValidData) {
        console.warn('[MediaPipe] Todos los keypoints son 0 o NaN');
        return null;
      }

      // Normalizar los valores para el modelo
      const normalizedKeypoints = keypoints.map(val => {
        if (isNaN(val)) return 0;
        // Clamp valores entre 0 y 1
        return Math.max(0, Math.min(1, val));
      });

      if (debug) {
        console.log('[MediaPipe] Keypoints extraídos:', {
          original: keypoints.slice(0, 6),
          normalized: normalizedKeypoints.slice(0, 6),
          hasValidData
        });
      }

      return normalizedKeypoints;
    } catch (error) {
      console.error('[MediaPipe] Error extrayendo keypoints:', error);
      return null;
    }
  }, [debug]);

  // Función para procesar resultados con mejor manejo
  const onResults = useCallback((results) => {
    if (!canvasRef.current || !results) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibujar la imagen del video
    if (results.image) {
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    }

    // Procesar manos detectadas
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      setHandCount(results.multiHandLandmarks.length);
      
      // Dibujar las manos
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const landmarks = results.multiHandLandmarks[i];
        const handedness = results.multiHandedness?.[i];

        // Dibujar conexiones
        drawingUtils.drawConnectors(
          ctx, 
          landmarks, 
          HAND_CONNECTIONS,
          { color: '#00FF00', lineWidth: 3 }
        );

        // Dibujar landmarks
        drawingUtils.drawLandmarks(
          ctx, 
          landmarks,
          { 
            color: handedness?.label === 'Left' ? '#FF0000' : '#0000FF', 
            lineWidth: 1,
            radius: 5
          }
        );

        // Extraer y validar keypoints
        const keypoints = extractKeypoints(landmarks);
        
        if (keypoints && onHandDetection) {
          // Guardar últimos landmarks válidos
          lastValidLandmarksRef.current = keypoints;
          
          // Enviar keypoints al clasificador
          onHandDetection({
            keypoints,
            handedness: handedness?.label || 'Unknown',
            confidence: handedness?.score || 0,
            timestamp: Date.now(),
            frameNumber: frameCountRef.current
          });

          if (debug) {
            console.log('[MediaPipe] Mano detectada:', {
              mano: handedness?.label,
              confianza: handedness?.score,
              frame: frameCountRef.current
            });
          }
        }
      }
    } else {
      setHandCount(0);
      
      // Si no hay detección, intentar con los últimos landmarks válidos
      if (lastValidLandmarksRef.current && frameCountRef.current % 30 === 0) {
        if (debug) {
          console.log('[MediaPipe] Sin detección, usando último frame válido');
        }
      }
    }

    ctx.restore();
    
    // Actualizar contador de frames
    frameCountRef.current++;
    if (frameCountRef.current % 30 === 0) {
      setProcessedFrames(frameCountRef.current);
      const now = Date.now();
      if (lastProcessTime > 0) {
        const fps = 30000 / (now - lastProcessTime);
        if (debug) {
          console.log(`[MediaPipe] FPS: ${fps.toFixed(1)}`);
        }
      }
      setLastProcessTime(now);
    }
    
    isProcessingRef.current = false;
  }, [onHandDetection, extractKeypoints, debug]);

  // Inicializar MediaPipe Hands con configuración optimizada
  useEffect(() => {
    if (!isActive) return;

    const initializeMediaPipe = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Crear instancia de Hands con configuración optimizada
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        // Configurar opciones optimizadas para web
        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1, // Modelo balanceado
          minDetectionConfidence: minDetectionConfidence,
          minTrackingConfidence: minTrackingConfidence,
          selfieMode: true, // Para cámara frontal
        });

        hands.onResults(onResults);
        handsRef.current = hands;

        console.log('[MediaPipe] ✅ Hands inicializado correctamente');

        // Esperar a que el video esté listo
        const video = videoRef.current;
        if (video && video.readyState >= 2) {
          startCamera();
        } else if (video) {
          video.addEventListener('loadeddata', startCamera);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('[MediaPipe] Error inicializando:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    const startCamera = async () => {
      if (!handsRef.current || !videoRef.current) return;

      try {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (!isProcessingRef.current && handsRef.current && videoRef.current) {
              isProcessingRef.current = true;
              
              // Asegurarse de que el video tiene dimensiones válidas
              if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
                await handsRef.current.send({ image: videoRef.current });
              } else {
                isProcessingRef.current = false;
              }
            }
          },
          width: 640,
          height: 480,
          facingMode: 'user'
        });

        await camera.start();
        cameraRef.current = camera;
        
        console.log('[MediaPipe] ✅ Cámara iniciada correctamente');
      } catch (err) {
        console.error('[MediaPipe] Error iniciando cámara:', err);
        setError('Error al acceder a la cámara: ' + err.message);
      }
    };

    initializeMediaPipe();

    // Cleanup
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
        cameraRef.current = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      frameCountRef.current = 0;
      lastValidLandmarksRef.current = null;
    };
  }, [isActive, onResults, minDetectionConfidence, minTrackingConfidence]);

  // Crear elementos de video y canvas
  useEffect(() => {
    if (!isActive) return;

    // Crear video element
    if (!videoRef.current) {
      const video = document.createElement('video');
      video.className = 'input_video';
      video.style.display = 'none';
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      document.body.appendChild(video);
      videoRef.current = video;
    }

    // Crear canvas element
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.className = 'output_canvas';
      canvas.width = 640;
      canvas.height = 480;
      canvas.style.position = 'absolute';
      canvas.style.left = '0';
      canvas.style.top = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.objectFit = 'cover';
      
      const container = document.getElementById('camera-container');
      if (container) {
        container.appendChild(canvas);
      }
      canvasRef.current = canvas;
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.remove();
        videoRef.current = null;
      }
      if (canvasRef.current) {
        canvasRef.current.remove();
        canvasRef.current = null;
      }
    };
  }, [isActive]);

  return {
    isLoading,
    error,
    handCount,
    processedFrames,
    videoRef,
    canvasRef,
    // Métodos de control
    resetDetection: useCallback(() => {
      frameCountRef.current = 0;
      lastValidLandmarksRef.current = null;
      setProcessedFrames(0);
      setHandCount(0);
    }, []),
    getLastValidKeypoints: useCallback(() => {
      return lastValidLandmarksRef.current;
    }, [])
  };
};

export default useMediaPipeDetection;
