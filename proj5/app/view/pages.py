from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates

router = APIRouter(include_in_schema=False)
templates = Jinja2Templates(directory="templates")

@router.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "title": "AI API Dashboard"})

@router.get("/demo/vision/{task_type}")
async def vision_demo(request: Request, task_type: str):
    tasks = {
        "classification": {"title": "이미지 분류", "endpoint": "/api/classify", "desc": "이미지를 업로드하면 무엇인지 분류합니다."},
        "detection": {"title": "객체 감지", "endpoint": "/api/detect", "desc": "이미지 내의 객체 위치와 종류를 찾습니다."},
        "face-detection": {"title": "얼굴 감지", "endpoint": "/api/face-detect", "desc": "이미지 내의 얼굴을 찾아 박스를 그립니다."},
        "face-landmark": {"title": "얼굴 랜드마크", "endpoint": "/api/face-landmark", "desc": "얼굴의 주요 특징점(눈, 코, 입, 윤곽)을 찾습니다."},
        "hand-landmark": {"title": "손 랜드마크", "endpoint": "/api/hand-landmark", "desc": "손가락 관절 등 손의 주요 특징점을 찾습니다."},
        "pose-landmark": {"title": "포즈 랜드마크", "endpoint": "/api/pose-landmark", "desc": "신체의 주요 관절 포즈를 찾습니다."},
        "face-match": {"title": "얼굴 일치 확인", "endpoint": "/api/face-match", "desc": "두 얼굴 사진이 동일인인지 확인합니다."}
    }
    
    if task_type not in tasks:
        # Fallback for unknown tasks
        return templates.TemplateResponse("index.html", {"request": request, "title": "Dashboard"})
        
    template_name = "face_match.html" if task_type == "face-match" else "vision.html"
    
    return templates.TemplateResponse(template_name, {
        "request": request, 
        "title": tasks[task_type]["title"],
        "endpoint": tasks[task_type]["endpoint"],
        "desc": tasks[task_type]["desc"]
    })

@router.get("/demo/text/{task_type}")
async def text_demo(request: Request, task_type: str):
    tasks = {
        "sentiment": {"title": "감정 분석", "endpoint": "/api/sentiment", "desc": "텍스트의 감정(긍정/부정)을 분석합니다."},
        "similarity": {"title": "텍스트 유사도", "endpoint": "/api/similarity", "desc": "두 텍스트 문장이 얼마나 유사한지 비교합니다."}
    }

    if task_type not in tasks:
        return templates.TemplateResponse("index.html", {"request": request, "title": "Dashboard"})

    return templates.TemplateResponse("text.html", {
        "request": request,
        "title": tasks[task_type]["title"],
        "endpoint": tasks[task_type]["endpoint"],
        "desc": tasks[task_type]["desc"],
        "is_similarity": task_type == "similarity"
    })

@router.get("/camera")
async def camera_suite(request: Request):
    """
    통합 카메라 슈트 페이지
    모든 Vision API를 한 화면에서 테스트 할 수 있습니다.
    """
    return templates.TemplateResponse("camera_suite.html", {"request": request})
