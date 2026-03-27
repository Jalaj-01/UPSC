from fastapi import APIRouter, HTTPException
from services import ai_service, progress_service, evaluation_service
from datetime import datetime, timedelta

router = APIRouter(prefix="/mentor", tags=["mentor"])

db = None

def set_db(database):
    global db
    db = database

@router.get("/daily-plan/{user_id}", response_model=dict)
async def get_daily_mentor_plan(user_id: str):
    """Get AI-generated daily study plan"""
    try:
        # Get recent performance
        yesterday = datetime.now() - timedelta(days=1)
        recent_answers = await db.answers.find(
            {
                "user_id": user_id,
                "evaluation": {"$exists": True},
                "created_at": {"$gte": yesterday.isoformat()}
            },
            {"_id": 0}
        ).limit(5).to_list(5)
        
        # Identify weak areas
        weak_areas = []
        for answer in recent_answers:
            if answer.get('evaluation'):
                weak_areas.extend(evaluation_service.identify_weak_areas(answer['evaluation']))
        
        weak_areas = list(set(weak_areas))
        
        # Get performance summary
        evaluations = [a['evaluation'] for a in recent_answers if 'evaluation' in a]
        recent_performance = {
            "answers_written": len(recent_answers),
            "average_score": sum(e.get('overall_score', 0) for e in evaluations) / len(evaluations) if evaluations else 0
        }
        
        # Generate AI plan
        plan = await ai_service.generate_ai_mentor_plan(user_id, weak_areas, recent_performance)
        
        return {
            "success": True,
            "plan": plan,
            "weak_areas": weak_areas,
            "recent_performance": recent_performance
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/gamification/{user_id}", response_model=dict)
async def get_gamification_data(user_id: str):
    """Get gamification data (streaks, levels, progress bars)"""
    try:
        # Get user
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Calculate mentor level based on total answers
        total_answers = user.get('total_answers_written', 0)
        mentor_level = min(10, (total_answers // 10) + 1)  # Level up every 10 answers
        
        # Get streak
        streak_days = user.get('streak_days', 0)
        
        # Calculate progress bars
        progress_bars = {
            "answers_this_week": {
                "current": 0,
                "target": 20,
                "percentage": 0
            },
            "mcqs_this_week": {
                "current": 0,
                "target": 50,
                "percentage": 0
            }
        }
        
        # Get this week's data
        week_start = datetime.now() - timedelta(days=7)
        week_answers = await db.answers.count_documents({
            "user_id": user_id,
            "created_at": {"$gte": week_start.isoformat()}
        })
        
        week_mcqs = await db.mcq_submissions.count_documents({
            "user_id": user_id
        })
        
        progress_bars["answers_this_week"]["current"] = week_answers
        progress_bars["answers_this_week"]["percentage"] = min(100, (week_answers / 20) * 100)
        
        progress_bars["mcqs_this_week"]["current"] = week_mcqs
        progress_bars["mcqs_this_week"]["percentage"] = min(100, (week_mcqs / 50) * 100)
        
        # Achievements
        achievements = []
        if streak_days >= 7:
            achievements.append({"title": "Week Warrior", "icon": "🔥", "description": f"{streak_days} day streak!"})
        if total_answers >= 50:
            achievements.append({"title": "Answer Master", "icon": "📝", "description": "50+ answers written"})
        if mentor_level >= 5:
            achievements.append({"title": "Rising Star", "icon": "⭐", "description": f"Level {mentor_level}"})
        
        return {
            "success": True,
            "streak_days": streak_days,
            "mentor_level": mentor_level,
            "progress_bars": progress_bars,
            "achievements": achievements
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
