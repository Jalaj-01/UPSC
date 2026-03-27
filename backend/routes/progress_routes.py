from fastapi import APIRouter, HTTPException
from models.progress import Progress, ProgressUpdate, PerformanceMetrics
from services import progress_service, evaluation_service
from typing import List
from datetime import datetime, date, timedelta

router = APIRouter(prefix="/progress", tags=["progress"])

db = None

def set_db(database):
    global db
    db = database

@router.post("/update", response_model=dict)
async def update_progress(progress_data: ProgressUpdate):
    """Update daily progress for a user"""
    try:
        # Check if progress exists for today
        existing = await db.progress.find_one({
            "user_id": progress_data.user_id,
            "date": progress_data.date.isoformat()
        })
        
        if existing:
            # Update existing
            update_data = progress_data.model_dump()
            update_data['date'] = update_data['date'].isoformat()
            
            await db.progress.update_one(
                {"id": existing['id']},
                {"$set": update_data}
            )
            message = "Progress updated"
        else:
            # Create new
            progress = Progress(**progress_data.model_dump())
            progress_dict = progress.model_dump()
            progress_dict['created_at'] = progress_dict['created_at'].isoformat()
            progress_dict['date'] = progress_dict['date'].isoformat()
            
            await db.progress.insert_one(progress_dict)
            message = "Progress created"
        
        return {
            "success": True,
            "message": message
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=dict)
async def get_user_progress(user_id: str, days: int = 30):
    """Get progress data for a user"""
    try:
        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=days)
        
        progress_records = await db.progress.find(
            {
                "user_id": user_id,
                "date": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat()
                }
            },
            {"_id": 0}
        ).sort("date", 1).to_list(days)
        
        return {
            "success": True,
            "progress": progress_records,
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/{user_id}", response_model=dict)
async def get_performance_metrics(user_id: str, days: int = 7):
    """Get performance metrics for a user"""
    try:
        # Get recent answers with evaluations
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        answers = await db.answers.find(
            {
                "user_id": user_id,
                "evaluation": {"$exists": True},
                "created_at": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat()
                }
            },
            {"_id": 0}
        ).to_list(100)
        
        # Extract evaluations
        evaluations = [a['evaluation'] for a in answers if 'evaluation' in a]
        
        # Calculate metrics
        metrics = progress_service.calculate_performance_metrics(evaluations)
        
        # Calculate improvement rate
        recent_scores = [e.get('overall_score', 0) for e in evaluations]
        improvement = progress_service.calculate_improvement_rate(recent_scores, days)
        
        return {
            "success": True,
            "metrics": metrics.model_dump(),
            "improvement": improvement,
            "total_answers": len(evaluations)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/{user_id}", response_model=dict)
async def get_progress_alerts(user_id: str):
    """Get progress alerts for a user"""
    try:
        # Get user stats
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get recent performance
        recent_answers = await db.answers.find(
            {"user_id": user_id, "evaluation": {"$exists": True}},
            {"_id": 0}
        ).sort("created_at", -1).limit(10).to_list(10)
        
        evaluations = [a['evaluation'] for a in recent_answers]
        
        # Collect weak areas
        weak_areas = []
        for eval in evaluations:
            if eval.get('structure_score', 0) < 6:
                weak_areas.append('structure')
            if eval.get('content_score', 0) < 6:
                weak_areas.append('content')
        
        # Count repeated mistakes
        repeated_mistakes = len([w for w in weak_areas if weak_areas.count(w) > 2])
        
        # Calculate recent improvement
        recent_scores = [e.get('overall_score', 0) for e in evaluations]
        improvement_data = progress_service.calculate_improvement_rate(recent_scores)
        
        user_data = {
            "streak_days": user.get('streak_days', 0),
            "recent_improvement": improvement_data.get('improvement', 0),
            "weak_areas": list(set(weak_areas)),
            "repeated_mistakes": repeated_mistakes
        }
        
        alerts = progress_service.generate_progress_alerts(user_data)
        
        return {
            "success": True,
            "alerts": alerts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chart-data/{user_id}", response_model=dict)
async def get_chart_data(user_id: str, days: int = 7):
    """Get performance chart data"""
    try:
        # Get recent answers
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        answers = await db.answers.find(
            {
                "user_id": user_id,
                "evaluation": {"$exists": True},
                "created_at": {
                    "$gte": start_date.isoformat(),
                    "$lte": end_date.isoformat()
                }
            },
            {"_id": 0}
        ).sort("created_at", 1).to_list(100)
        
        # Format data for charts
        chart_data = []
        for answer in answers:
            eval = answer.get('evaluation', {})
            chart_data.append({
                "date": answer['created_at'],
                "structure": eval.get('structure_score', 0),
                "content": eval.get('content_score', 0),
                "depth": eval.get('depth_score', 0),
                "keywords": eval.get('keyword_score', 0),
                "overall": eval.get('overall_score', 0)
            })
        
        return {
            "success": True,
            "chart_data": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/readiness/{user_id}", response_model=dict)
async def get_exam_readiness(user_id: str):
    """Get exam readiness prediction"""
    try:
        # Get performance metrics
        answers = await db.answers.find(
            {"user_id": user_id, "evaluation": {"$exists": True}},
            {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        
        evaluations = [a['evaluation'] for a in answers]
        metrics = progress_service.calculate_performance_metrics(evaluations)
        
        # Get weak areas
        weak_areas = []
        for eval in evaluations:
            weak_areas.extend(evaluation_service.identify_weak_areas(eval))
        
        weak_areas = list(set(weak_areas))
        
        # Calculate consistency (standard deviation)
        scores = [e.get('overall_score', 0) for e in evaluations]
        if len(scores) > 1:
            mean = sum(scores) / len(scores)
            variance = sum((x - mean) ** 2 for x in scores) / len(scores)
            std_dev = variance ** 0.5
            consistency = max(0, 1 - (std_dev / 10))  # Normalize
        else:
            consistency = 0.5
        
        performance_data = {
            "overall_avg": metrics.overall_avg,
            "consistency": consistency,
            "weak_areas": weak_areas
        }
        
        readiness = progress_service.predict_readiness(performance_data)
        
        return {
            "success": True,
            "readiness": readiness
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))