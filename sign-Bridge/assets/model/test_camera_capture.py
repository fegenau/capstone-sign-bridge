"""Diagnóstico de cámaras disponibles.
Intenta abrir índices 0-9 con dos backends y reporta cuál funciona.
"""
import cv2

def check_indices(max_index=10):
    results = []
    for i in range(max_index):
        cap = cv2.VideoCapture(i)
        ok = cap.isOpened()
        frame_ok = False
        if ok:
            ret, frame = cap.read()
            frame_ok = ret and frame is not None
        cap.release()
        results.append((i, ok, frame_ok))
    return results

if __name__ == "__main__":
    print("Buscando cámaras (backend por defecto)...")
    default_results = check_indices(10)
    for idx, opened, frame_ok in default_results:
        print(f"Índice {idx}: abierto={opened} frame_ok={frame_ok}")
    print("\nIntentando con DirectShow (Windows)...")
    dshow_results = []
    for i in range(10):
        cap = cv2.VideoCapture(i, cv2.CAP_DSHOW)
        opened = cap.isOpened()
        frame_ok = False
        if opened:
            ret, frame = cap.read()
            frame_ok = ret and frame is not None
        cap.release()
        dshow_results.append((i, opened, frame_ok))
    for idx, opened, frame_ok in dshow_results:
        print(f"[DShow] Índice {idx}: abierto={opened} frame_ok={frame_ok}")
    
    print("\nConsejos si ninguno funciona:")
    print(" 1. Cierra otras apps que usen la cámara (Zoom, Teams, etc.)")
    print(" 2. Configuración > Privacidad > Cámara: habilita acceso para aplicaciones de escritorio")
    print(" 3. Si es cámara USB: prueba otro puerto")
    print(" 4. Actualiza drivers de la cámara")
