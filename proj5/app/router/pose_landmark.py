"""포즈 랜드마크 (Tasks API)"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np, cv2, base64

router = APIRouter(prefix="/api", tags=["pose-landmark"])
LOAD_ERR = None

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    
    MODEL_PATH = r'c:\Users\301\dev\proj1\models\pose_landmarker_full.task'
    with open(MODEL_PATH, 'rb') as f:
        model_content = f.read()

    det = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_buffer=model_content), output_segmentation_masks=True))
except Exception as e:
    import traceback
    LOAD_ERR = f"{e}\n{traceback.format_exc()}"
    print(f"Error loading pose-landmark: {LOAD_ERR}")
    det = None
    mp = None

@router.post("/pose-landmark")
async def pose_landmark(file: UploadFile = File(...)):
    if det is None: raise HTTPException(500, f"Tasks Model not loaded. Err: {LOAD_ERR}")
    img = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    if img is None: raise HTTPException(400, "Bad Image")
    
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    res = det.detect(mp_image)
    
    h, w, _ = img.shape
    for pl in res.pose_landmarks:
        for l in pl:
            cv2.circle(img, (int(l.x * w), int(l.y * h)), 2, (255, 0, 0), -1)

    return {"pose_detected": bool(res.pose_landmarks), "image_base64": base64.b64encode(cv2.imencode('.jpg', img)[1]).decode()}
