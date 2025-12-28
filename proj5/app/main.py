"""FastAPI 메인 앱"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.router import (
    similarity, face_comparison, classification, detection,
    face_detection, face_landmark, hand_landmark, pose_landmark, sentiment
)
from app.view import pages

app = FastAPI(title="AI API", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(pages.router)

for r in [similarity, face_comparison, classification, detection, face_detection, face_landmark, hand_landmark, pose_landmark, sentiment]:
    app.include_router(r.router)

@app.get("/")
def root(): return {"msg": "AI Service Running", "docs": "/docs"}
