"""감정 분석"""
from fastapi import APIRouter, HTTPException; from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["sentiment"])

try:
    from transformers import pipeline
    clf = pipeline("sentiment-analysis", model="daekeun-ml/koelectra-small-v3-nsmc")
except Exception as e:
    print(f"Error loading sentiment: {e}")
    clf = None

class Req(BaseModel): text: str

@router.post("/sentiment")
async def sentiment(r: Req):
    if clf is None: raise HTTPException(500, "Model/Lib not loaded")
    res = clf(r.text)[0]
    return {"text": r.text, "sentiment": "😊 긍정" if res['label'] == '1' else "😠 부정", "score": round(res['score'], 4)}
