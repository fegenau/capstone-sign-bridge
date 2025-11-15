"""
Script para probar cada índice de cámara y guardar un frame de prueba
"""
import cv2
import time

def test_camera_with_warmup(index, use_dshow=False):
    """Prueba una cámara con warmup y guarda un frame"""
    print(f"\n{'='*60}")
    backend_name = "DirectShow" if use_dshow else "Default"
    print(f"Probando cámara índice {index} con backend {backend_name}...")
    
    try:
        if use_dshow:
            cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)
        else:
            cap = cv2.VideoCapture(index)
        
        if not cap.isOpened():
            print(f"❌ No se pudo abrir cámara {index}")
            return False
        
        print(f"✅ Cámara {index} abierta")
        
        # Configurar
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        
        # Warmup - descartar primeros frames
        print("⏳ Warmup: descartando 30 frames...")
        for i in range(30):
            ret, _ = cap.read()
            if not ret:
                print(f"⚠️ Fallo en frame {i+1} durante warmup")
        
        # Intentar capturar 5 frames de prueba
        print("📸 Capturando frames de prueba...")
        success_count = 0
        for i in range(5):
            ret, frame = cap.read()
            if ret and frame is not None:
                success_count += 1
                # Guardar primer frame exitoso
                if success_count == 1:
                    filename = f"test_camera_{index}_{backend_name.lower()}.jpg"
                    cv2.imwrite(filename, frame)
                    print(f"💾 Frame guardado: {filename}")
                    print(f"   Shape: {frame.shape}")
                    print(f"   Dtype: {frame.dtype}")
                    print(f"   Min/Max: {frame.min()}/{frame.max()}")
            time.sleep(0.1)
        
        cap.release()
        
        if success_count > 0:
            print(f"✅ Exitoso: {success_count}/5 frames capturados")
            return True
        else:
            print(f"❌ Falló: 0/5 frames capturados")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🎥 PRUEBA EXHAUSTIVA DE CÁMARAS")
    print("="*60)
    
    results = []
    
    # Probar índices 0-2 con ambos backends
    for idx in range(3):
        # Backend por defecto
        success_default = test_camera_with_warmup(idx, use_dshow=False)
        results.append((idx, "Default", success_default))
        
        # DirectShow
        success_dshow = test_camera_with_warmup(idx, use_dshow=True)
        results.append((idx, "DirectShow", success_dshow))
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE RESULTADOS")
    print("="*60)
    for idx, backend, success in results:
        status = "✅ FUNCIONA" if success else "❌ FALLA"
        print(f"Índice {idx} ({backend}): {status}")
    
    print("\n💡 RECOMENDACIÓN:")
    working = [(idx, backend) for idx, backend, success in results if success]
    if working:
        idx, backend = working[0]
        print(f"   Usa cámara índice {idx} con backend {backend}")
        if backend == "DirectShow":
            print(f"   En camera_simple.py: cv2.VideoCapture({idx}, cv2.CAP_DSHOW)")
        else:
            print(f"   En camera_simple.py: cv2.VideoCapture({idx})")
    else:
        print("   ⚠️ Ninguna cámara funcionó correctamente")
        print("   - Cierra otras aplicaciones (Teams, Zoom, Skype, etc.)")
        print("   - Verifica permisos de cámara en Windows")
        print("   - Prueba con una cámara USB externa")
