from fastapi import APIRouter, HTTPException
from models.test import Test, TestCreate, TestSubmission
from services import question_service
from typing import List
from datetime import datetime
import uuid

router = APIRouter(prefix="/tests", tags=["tests"])

db = None

def set_db(database):
    global db
    db = database

@router.post("/create", response_model=Test)
async def create_test(test_data: TestCreate):
    """Create a new test"""
    try:
        test = Test(**test_data.model_dump())
        
        test_dict = test.model_dump()
        test_dict['created_at'] = test_dict['created_at'].isoformat()
        if test_dict.get('completed_at'):
            test_dict['completed_at'] = test_dict['completed_at'].isoformat()
        
        await db.tests.insert_one(test_dict)
        
        return test
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/submit", response_model=dict)
async def submit_test(submission: TestSubmission):
    """Submit a completed test"""
    try:
        # Get test
        test = await db.tests.find_one({"id": submission.test_id}, {"_id": 0})
        if not test:
            raise HTTPException(status_code=404, detail="Test not found")
        
        # Calculate score (simplified for demo)
        total_questions = len(test['question_ids'])
        score = (len(submission.answers) / total_questions) * 100 if total_questions > 0 else 0
        
        # Update test
        update_data = {
            "answers": submission.answers,
            "score": score,
            "time_taken_minutes": submission.time_taken_minutes,
            "completed_at": datetime.now().isoformat()
        }
        
        await db.tests.update_one(
            {"id": submission.test_id},
            {"$set": update_data}
        )
        
        return {
            "success": True,
            "score": score,
            "total_questions": total_questions,
            "time_taken": submission.time_taken_minutes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[Test])
async def get_user_tests(user_id: str, limit: int = 20):
    """Get all tests for a user"""
    try:
        tests = await db.tests.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Convert ISO strings
        for test in tests:
            if isinstance(test.get('created_at'), str):
                test['created_at'] = datetime.fromisoformat(test['created_at'])
            if test.get('completed_at') and isinstance(test['completed_at'], str):
                test['completed_at'] = datetime.fromisoformat(test['completed_at'])
        
        return tests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/custom", response_model=dict)
async def create_custom_test(request: dict):
    """Create a custom test"""
    try:
        subjects = request.get('subjects', [])
        question_count = request.get('question_count', 10)
        question_type = request.get('question_type', 'mcq')
        user_id = request.get('user_id')
        
        if not subjects:
            raise HTTPException(status_code=400, detail="Subjects are required")
        
        # Generate questions
        questions = question_service.create_custom_test(subjects, question_count, question_type)
        question_ids = [str(uuid.uuid4()) for _ in questions]
        
        # Create test
        test_data = TestCreate(
            user_id=user_id,
            test_name=f"Custom Test - {', '.join(subjects)}",
            question_ids=question_ids,
            duration_minutes=question_count * 2,  # 2 minutes per question
            test_type="custom"
        )
        
        test = Test(**test_data.model_dump())
        test_dict = test.model_dump()
        test_dict['created_at'] = test_dict['created_at'].isoformat()
        
        await db.tests.insert_one(test_dict)
        
        return {
            "success": True,
            "test_id": test.id,
            "questions": questions,
            "duration_minutes": test.duration_minutes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/mock", response_model=dict)
async def create_mock_test(request: dict):
    """Create a full UPSC mock test"""
    try:
        user_id = request.get('user_id')
        paper_type = request.get('paper_type', 'GS1')  # GS1, GS2, GS3, GS4, CSAT
        
        # Create mock test with appropriate questions
        question_count = 100 if paper_type == 'CSAT' else 20
        duration = 120 if paper_type == 'CSAT' else 180
        
        # Get questions (simplified)
        from utils.sample_data import SAMPLE_MCQ_QUESTIONS
        questions = SAMPLE_MCQ_QUESTIONS[:question_count]
        question_ids = [q.get('id', str(uuid.uuid4())) for q in questions]
        
        test_data = TestCreate(
            user_id=user_id,
            test_name=f"Mock Test - {paper_type}",
            question_ids=question_ids,
            duration_minutes=duration,
            test_type="mock"
        )
        
        test = Test(**test_data.model_dump())
        test_dict = test.model_dump()
        test_dict['created_at'] = test_dict['created_at'].isoformat()
        
        await db.tests.insert_one(test_dict)
        
        return {
            "success": True,
            "test_id": test.id,
            "questions": questions,
            "duration_minutes": duration,
            "paper_type": paper_type
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))