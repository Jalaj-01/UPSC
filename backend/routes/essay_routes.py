from fastapi import APIRouter, HTTPException
from services import ai_service

router = APIRouter(prefix="/essay", tags=["essay"])

db = None

def set_db(database):
    global db
    db = database

@router.post("/outline", response_model=dict)
async def generate_essay_outline(request: dict):
    """Generate essay outline for a topic"""
    try:
        topic = request.get('topic')
        language = request.get('language', 'english')
        
        if not topic:
            raise HTTPException(status_code=400, detail="Topic is required")
        
        outline = await ai_service.generate_essay_outline(topic, language)
        
        return {
            "success": True,
            "topic": topic,
            "outline": outline
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate", response_model=dict)
async def evaluate_essay(request: dict):
    """Evaluate essay writing"""
    try:
        topic = request.get('topic')
        essay_text = request.get('essay')
        language = request.get('language', 'english')
        
        if not topic or not essay_text:
            raise HTTPException(status_code=400, detail="Topic and essay are required")
        
        # Use answer evaluation for essays (similar criteria)
        evaluation = await ai_service.evaluate_answer(topic, essay_text, language)
        
        return {
            "success": True,
            "evaluation": evaluation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics", response_model=dict)
async def get_essay_topics():
    """Get sample essay topics"""
    from utils.sample_data import SAMPLE_ESSAY_TOPICS
    
    return {
        "success": True,
        "topics": SAMPLE_ESSAY_TOPICS
    }