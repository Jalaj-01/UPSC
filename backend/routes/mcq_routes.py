from fastapi import APIRouter, HTTPException
from models.question import Question
from services import question_service, ai_service
from typing import List, Optional
from utils.sample_data import SAMPLE_MCQ_QUESTIONS
import uuid

router = APIRouter(prefix="/mcq", tags=["mcq"])

db = None

def set_db(database):
    global db
    db = database

@router.get("/questions", response_model=dict)
async def get_mcq_questions(
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = 10
):
    """Get MCQ questions with optional filters"""
    try:
        questions = SAMPLE_MCQ_QUESTIONS.copy()
        
        # Apply filters
        if subject:
            questions = [q for q in questions if q['subject'].lower() == subject.lower()]
        if topic:
            questions = [q for q in questions if q.get('topic', '').lower() == topic.lower()]
        if year:
            questions = [q for q in questions if q.get('year') == year]
        
        # Limit results
        questions = questions[:limit]
        
        return {
            "success": True,
            "questions": questions,
            "total": len(questions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/subjects", response_model=dict)
async def get_available_subjects():
    """Get list of available subjects"""
    try:
        subjects = question_service.get_available_subjects()
        return {
            "success": True,
            "subjects": subjects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/topics/{subject}", response_model=dict)
async def get_available_topics(subject: str):
    """Get list of available topics for a subject"""
    try:
        topics = question_service.get_available_topics(subject)
        return {
            "success": True,
            "topics": topics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/daily-task", response_model=dict)
async def get_daily_task_set(request: dict):
    """Generate daily task set"""
    try:
        count = request.get('count', 10)
        subjects = request.get('subjects')
        difficulty = request.get('difficulty')
        
        questions = question_service.get_daily_task_set(count, subjects, difficulty)
        
        return {
            "success": True,
            "questions": questions,
            "count": len(questions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=dict)
async def submit_mcq_answer(request: dict):
    """Submit MCQ answer and get result"""
    try:
        user_id = request.get('user_id')
        question_id = request.get('question_id')
        user_answer = request.get('answer')
        question_text = request.get('question')
        correct_answer = request.get('correct_answer')
        
        is_correct = user_answer == correct_answer
        
        # Get AI explanation
        explanation = await ai_service.generate_mcq_explanation(
            question_text,
            correct_answer,
            user_answer
        )
        
        # Store submission
        submission = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "question_id": question_id,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "is_correct": is_correct,
            "explanation": explanation
        }
        
        await db.mcq_submissions.insert_one(submission)
        
        return {
            "success": True,
            "is_correct": is_correct,
            "explanation": explanation,
            "correct_answer": correct_answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/wrong-questions/{user_id}", response_model=dict)
async def get_wrong_questions(user_id: str):
    """Get all questions answered incorrectly by user"""
    try:
        wrong_submissions = await db.mcq_submissions.find(
            {"user_id": user_id, "is_correct": False},
            {"_id": 0}
        ).to_list(100)
        
        return {
            "success": True,
            "wrong_questions": wrong_submissions,
            "count": len(wrong_submissions)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/revision-test", response_model=dict)
async def create_revision_test(request: dict):
    """Create a test from wrong questions"""
    try:
        user_id = request.get('user_id')
        
        # Get wrong questions
        wrong_submissions = await db.mcq_submissions.find(
            {"user_id": user_id, "is_correct": False},
            {"_id": 0}
        ).limit(20).to_list(20)
        
        question_ids = [s['question_id'] for s in wrong_submissions]
        
        return {
            "success": True,
            "question_ids": question_ids,
            "count": len(question_ids),
            "message": "Revision test created from your wrong answers"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))