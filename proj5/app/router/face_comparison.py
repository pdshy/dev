"""얼굴 일치 확인"""
from fastapi import APIRouter, File, UploadFile, HTTPException
import cv2, numpy as np

router = APIRouter(prefix="/api", tags=["face-match"])

try:
    from insightface.app import FaceAnalysis
    app = FaceAnalysis(name='buffalo_l', providers=['CPUExecutionProvider'])
    app.prepare(ctx_id=-1)
except Exception as e:
    print(f"Error loading face-match: {e}")
    app = None
    FaceAnalysis = None

@router.post("/face-match")
async def face_match(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    if app is None: raise HTTPException(500, "Model/Lib not loaded")
    def get_emb(b):
        img = cv2.imdecode(np.frombuffer(b, np.uint8), cv2.IMREAD_COLOR)
        faces = app.get(img)
        return faces[0].embedding if faces else None

    e1, e2 = get_emb(await file1.read()), get_emb(await file2.read())
    if e1 is None or e2 is None: raise HTTPException(400, "No face found")
    sim = float(np.dot(e1, e2) / (np.linalg.norm(e1) * np.linalg.norm(e2)))
    return {"similarity": round(sim, 4), "is_same_person": sim > 0.4, "threshold": 0.4}
