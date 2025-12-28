"""얼굴 랜드마크 (Tasks API)"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np, cv2, base64

router = APIRouter(prefix="/api", tags=["face-landmark"])
LOAD_ERR = None

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    
    # [FIX] Removed 'mediapipe.framework' import which does not exist.
    # We don't need it for custom drawing.
    
    MODEL_PATH = r'c:\Users\301\dev\proj1\models\face_landmarker.task'
    with open(MODEL_PATH, 'rb') as f:
        model_content = f.read()

    det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_buffer=model_content),
        output_face_blendshapes=True,
        num_faces=1))
        
except Exception as e:
    import traceback
    LOAD_ERR = f"{e}\n{traceback.format_exc()}"
    print(f"Error loading face-landmark: {LOAD_ERR}")
    det = None
    mp = None

@router.post("/face-landmark")
async def face_landmark(file: UploadFile = File(...)):
    if det is None: raise HTTPException(500, f"Tasks Model not loaded. Err: {LOAD_ERR}")
    img = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    if img is None: raise HTTPException(400, "Bad Image")
    
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=img_rgb)
    
    res = det.detect(mp_image)
    
    # Custom Drawing (OpenCV)
    h, w, _ = img.shape
    for fl in res.face_landmarks:
        for l in fl:
            cv2.circle(img, (int(l.x * w), int(l.y * h)), 1, (0, 255, 0), -1)

    return {"count": len(res.face_landmarks), "top_blendshapes": sorted([{"name": c.category_name, "score": round(c.score, 4)} for c in (res.face_blendshapes[0] if res.face_blendshapes else [])], key=lambda x:x['score'], reverse=True)[:5], "image_base64": base64.b64encode(cv2.imencode('.jpg', img)[1]).decode()}
