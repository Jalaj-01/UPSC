from fastapi import APIRouter, HTTPException
from models.note import Note, NoteCreate, Flashcard, FlashcardCreate
from services import ai_service
from typing import List
from datetime import datetime

router = APIRouter(prefix="/notes", tags=["notes"])

db = None

def set_db(database):
    global db
    db = database

@router.post("/create", response_model=Note)
async def create_note(note_data: NoteCreate):
    """Create a new note"""
    try:
        note = Note(**note_data.model_dump())
        
        # Generate AI summary if content is substantial
        if len(note.content) > 100:
            note.ai_summary = await ai_service.summarize_note(note.content)
        
        # Store in database
        note_dict = note.model_dump()
        note_dict['created_at'] = note_dict['created_at'].isoformat()
        note_dict['updated_at'] = note_dict['updated_at'].isoformat()
        
        await db.notes.insert_one(note_dict)
        
        return note
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/{user_id}", response_model=List[Note])
async def get_user_notes(user_id: str, subject: str = None, limit: int = 50):
    """Get all notes for a user"""
    try:
        query = {"user_id": user_id}
        if subject:
            query["subject"] = subject
        
        notes = await db.notes.find(query, {"_id": 0}).sort("updated_at", -1).limit(limit).to_list(limit)
        
        # Convert ISO strings
        for note in notes:
            if isinstance(note.get('created_at'), str):
                note['created_at'] = datetime.fromisoformat(note['created_at'])
            if isinstance(note.get('updated_at'), str):
                note['updated_at'] = datetime.fromisoformat(note['updated_at'])
        
        return notes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/update/{note_id}", response_model=dict)
async def update_note(note_id: str, request: dict):
    """Update an existing note"""
    try:
        update_data = request
        update_data['updated_at'] = datetime.now().isoformat()
        
        # Regenerate summary if content changed
        if 'content' in update_data and len(update_data['content']) > 100:
            update_data['ai_summary'] = await ai_service.summarize_note(update_data['content'])
        
        result = await db.notes.update_one(
            {"id": note_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        
        return {
            "success": True,
            "message": "Note updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{note_id}", response_model=dict)
async def delete_note(note_id: str):
    """Delete a note"""
    try:
        result = await db.notes.delete_one({"id": note_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        
        return {
            "success": True,
            "message": "Note deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Flashcard routes
@router.post("/flashcards/create", response_model=Flashcard)
async def create_flashcard(flashcard_data: FlashcardCreate):
    """Create a new flashcard"""
    try:
        flashcard = Flashcard(**flashcard_data.model_dump())
        
        flashcard_dict = flashcard.model_dump()
        flashcard_dict['created_at'] = flashcard_dict['created_at'].isoformat()
        if flashcard_dict.get('last_reviewed'):
            flashcard_dict['last_reviewed'] = flashcard_dict['last_reviewed'].isoformat()
        
        await db.flashcards.insert_one(flashcard_dict)
        
        return flashcard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flashcards/user/{user_id}", response_model=List[Flashcard])
async def get_user_flashcards(user_id: str, subject: str = None, limit: int = 50):
    """Get flashcards for a user"""
    try:
        query = {"user_id": user_id}
        if subject:
            query["subject"] = subject
        
        flashcards = await db.flashcards.find(query, {"_id": 0}).limit(limit).to_list(limit)
        
        # Convert ISO strings
        for fc in flashcards:
            if isinstance(fc.get('created_at'), str):
                fc['created_at'] = datetime.fromisoformat(fc['created_at'])
            if fc.get('last_reviewed') and isinstance(fc['last_reviewed'], str):
                fc['last_reviewed'] = datetime.fromisoformat(fc['last_reviewed'])
        
        return flashcards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/flashcards/review/{flashcard_id}", response_model=dict)
async def review_flashcard(flashcard_id: str, request: dict):
    """Mark flashcard as reviewed"""
    try:
        mastery_level = request.get('mastery_level', 0)
        
        result = await db.flashcards.update_one(
            {"id": flashcard_id},
            {
                "$set": {"last_reviewed": datetime.now().isoformat()},
                "$inc": {"review_count": 1},
                "$set": {"mastery_level": mastery_level}
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Flashcard not found")
        
        return {
            "success": True,
            "message": "Flashcard reviewed"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/flashcards/daily/{user_id}", response_model=dict)
async def get_daily_flashcards(user_id: str, count: int = 15):
    """Get daily flashcards for review"""
    try:
        # Get flashcards that need review (not reviewed recently or low mastery)
        flashcards = await db.flashcards.find(
            {"user_id": user_id, "mastery_level": {"$lt": 5}},
            {"_id": 0}
        ).limit(count).to_list(count)
        
        return {
            "success": True,
            "flashcards": flashcards,
            "count": len(flashcards)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))