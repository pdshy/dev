"""이미지 분류"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import numpy as np, cv2

router = APIRouter(prefix="/api", tags=["classification"])

try:
    import mediapipe as mp
    from mediapipe.tasks.python import vision, BaseOptions
    MODEL = r'c:\Users\301\dev\proj1\models\efficientnet_lite0.tflite'
    clf = vision.ImageClassifier.create_from_options(vision.ImageClassifierOptions(
        base_options=BaseOptions(model_asset_path=MODEL), max_results=3))
except Exception as e:
    print(f"Error loading classification: {e}")
    clf = None
    mp = None

@router.post("/classify")
async def classify(file: UploadFile = File(...)):
    if clf is None: raise HTTPException(500, "Model/Lib not loaded")
    img = cv2.imdecode(np.frombuffer(await file.read(), np.uint8), cv2.IMREAD_COLOR)
    if img is None: raise HTTPException(400, "Bad Image")
    res = clf.classify(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
    return {"results": [{"category": c.category_name, "score": round(c.score, 4)} for c in (res.classifications[0].categories if res.classifications else [])]}
