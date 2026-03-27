from fastapi import APIRouter, HTTPException
from services import ai_service
from typing import List
import uuid

router = APIRouter(prefix="/doubts", tags=["doubts"])

db = None

def set_db(database):
    global db
    db = database

@router.post("/ask", response_model=dict)
async def ask_doubt(request: dict):
    """Ask a doubt and get AI response"""
    try:
        user_id = request.get('user_id')
        question = request.get('question')
        context = request.get('context')
        
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        # Get AI answer
        answer = await ai_service.answer_doubt(question, context)
        
        # Store in chat history
        chat_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "question": question,
            "answer": answer,
            "context": context,
            "timestamp": datetime.now().isoformat()
        }
        
        await db.doubt_chats.insert_one(chat_entry)
        
        return {
            "success": True,
            "answer": answer
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}", response_model=dict)
async def get_doubt_history(user_id: str, limit: int = 20):
    """Get doubt chat history for a user"""
    try:
        chats = await db.doubt_chats.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {
            "success": True,
            "chats": chats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from datetime import datetime