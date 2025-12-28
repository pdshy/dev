"""텍스트 유사도"""
from fastapi import APIRouter; from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["similarity"])

try:
    from sentence_transformers import SentenceTransformer; from sklearn.metrics.pairwise import cosine_similarity
    model = SentenceTransformer('jhgan/ko-sbert-nli')
except Exception as e:
    print(f"Error loading similarity: {e}")
    model = None

LABELS = [(0.9, "🟢 매우 유사"), (0.7, "🟢 유사"), (0.5, "🟡 보통"), (0.3, "🟠 낮음"), (0.0, "🔴 매우 낮음")]

class Req(BaseModel): base_text: str; compare_texts: list[str]

@router.post("/similarity")
async def similarity(r: Req):
    if model is None: raise HTTPException(500, "Model/Lib not loaded")
    base = model.encode([r.base_text])[0]
    res = []
    for t in r.compare_texts:
        score = float(cosine_similarity([base], [model.encode([t])[0]])[0][0])
        res.append({"text": t, "score": round(score, 4), "label": next((l for th, l in LABELS if score >= th), LABELS[-1][1])})
    return {"base": r.base_text, "rank": [{"rank": i+1, **d} for i, d in enumerate(sorted(res, key=lambda x: x['score'], reverse=True))]}
