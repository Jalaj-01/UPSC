from fastapi import APIRouter, HTTPException, UploadFile, File
from models.answer import Answer, AnswerCreate, AnswerEvaluation
from services import ai_service, evaluation_service
from typing import List
import os

router = APIRouter(prefix="/answers", tags=["answers"])

# Get database from main app
db = None

def set_db(database):
    global db
    db = database

@router.post("/generate", response_model=dict)
async def generate_answer(request: dict):
    """
    Generate AI answer for a question
    Body: { question: str, language: str }
    """
    try:
        question = request.get('question')
        language = request.get('language', 'english')
        
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        answer_text = await ai_service.generate_answer(question, language)
        
        return {
            "success": True,
            "answer": answer_text,
            "question": question
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=Answer)
async def submit_answer(answer_data: AnswerCreate):
    """Submit an answer for evaluation"""
    try:
        # Create answer object
        answer = Answer(**answer_data.model_dump())
        
        # Store in database
        answer_dict = answer.model_dump()
        answer_dict['created_at'] = answer_dict['created_at'].isoformat()
        
        await db.answers.insert_one(answer_dict)
        
        return answer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate", response_model=dict)
async def evaluate_answer(request: dict):
    """
    Evaluate a user's answer
    Body: { question: str, answer: str, language: str }
    """
    try:
        question = request.get('question')
        user_answer = request.get('answer')
        language = request.get('language', 'english')
        
        if not question or not user_answer:
            raise HTTPException(status_code=400, detail="Question and answer are required")
        
        # Get AI evaluation
        evaluation = await ai_service.evaluate_answer(question, user_answer, language)
        
        # Calculate overall score if not provided
        if 'overall_score' not in evaluation:
            evaluation['overall_score'] = evaluation_service.calculate_overall_score(evaluation)
        
        # Identify weak and strong areas
        weak_areas = evaluation_service.identify_weak_areas(evaluation)
        strong_areas = evaluation_service.identify_strong_areas(evaluation)
        
        return {
            "success": True,
            "evaluation": evaluation,
            "weak_areas": weak_areas,
            "strong_areas": strong_areas
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[Answer])
async def get_user_answers(user_id: str, limit: int = 20):
    """Get all answers by a user"""
    try:
        answers = await db.answers.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Convert ISO strings back to datetime
        for answer in answers:
            if isinstance(answer.get('created_at'), str):
                from datetime import datetime
                answer['created_at'] = datetime.fromisoformat(answer['created_at'])
        
        return answers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback/{user_id}", response_model=dict)
async def get_answer_feedback_history(user_id: str, limit: int = 10):
    """Get feedback history for a user"""
    try:
        answers = await db.answers.find(
            {"user_id": user_id, "evaluation": {"$exists": True}},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        feedback_history = []
        for answer in answers:
            if answer.get('evaluation'):
                feedback_history.append({
                    "answer_id": answer['id'],
                    "date": answer['created_at'],
                    "evaluation": answer['evaluation']
                })
        
        return {
            "success": True,
            "feedback_history": feedback_history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
