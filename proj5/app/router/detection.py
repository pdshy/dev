"""객체 감지"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np, cv2, base64

router = APIRouter(prefix="/api", tags=["detection"])

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    MODEL = r'c:\Users\301\dev\proj1\models\efficientdet_lite0.tflite'
    det = vision.ObjectDetector.create_from_options(vision.ObjectDetectorOptions(
        base_options=BaseOptions(model_asset_path=MODEL), score_threshold=0.5))
except Exception as e:
    print(f"Error loading detection: {e}")
    det = None
    mp = None

@router.post("/detect")
async def detect(file: UploadFile = File(...)):
    if det is None: raise HTTPException(500, "Model/Lib not loaded")
    img = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    if img is None: raise HTTPException(400, "Bad Image")
    res = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    
    for d in res.detections:
        bb = d.bounding_box
        cv2.rectangle(img, (bb.origin_x, bb.origin_y), (bb.origin_x+bb.width, bb.origin_y+bb.height), (255,0,0), 3)
        cv2.putText(img, f"{d.categories[0].category_name} ({d.categories[0].score:.2f})", (bb.origin_x+10, bb.origin_y+20), 4, 1, (255,0,0), 1)

    return {"count": len(res.detections), "detections": [{"category": d.categories[0].category_name, "score": round(d.categories[0].score, 4), "bbox": {"x": bb.origin_x, "y": bb.origin_y, "w": bb.width, "h": bb.height}} for d in res.detections], "image_base64": base64.b64encode(cv2.imencode('.jpg', img)[1]).decode()}
