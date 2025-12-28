"""손 랜드마크 (Tasks API)"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np, cv2, base64

router = APIRouter(prefix="/api", tags=["hand-landmark"])
LOAD_ERR = None

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    
    MODEL_PATH = r'c:\Users\301\dev\proj1\models\hand_landmarker.task'
    with open(MODEL_PATH, 'rb') as f:
        model_content = f.read()

    det = vision.HandLandmarker.create_from_options(vision.HandLandmarkerOptions(
        base_options=BaseOptions(model_asset_buffer=model_content), num_hands=2))
except Exception as e:
    import traceback
    LOAD_ERR = f"{e}\n{traceback.format_exc()}"
    print(f"Error loading hand-landmark: {LOAD_ERR}")
    det = None
    mp = None

@router.post("/hand-landmark")
async def hand_landmark(file: UploadFile = File(...)):
    if det is None: raise HTTPException(500, f"Tasks Model not loaded. Err: {LOAD_ERR}")
    img = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    if img is None: raise HTTPException(400, "Bad Image")
    
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    res = det.detect(mp_image)
    
    h, w, _ = img.shape
    for hl in res.hand_landmarks:
        for l in hl:
            cv2.circle(img, (int(l.x * w), int(l.y * h)), 2, (0, 0, 255), -1)

    return {"count": len(res.hand_landmarks), "hands": [{"label": h[0].category_name, "score": round(h[0].score, 4)} for h in res.handedness], "image_base64": base64.b64encode(cv2.imencode('.jpg', img)[1]).decode()}
