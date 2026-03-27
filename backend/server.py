from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

# Import all routes
from routes.answer_routes import router as answer_router, set_db as set_answer_db
from routes.mcq_routes import router as mcq_router, set_db as set_mcq_db
from routes.progress_routes import router as progress_router, set_db as set_progress_db
from routes.voice_routes import router as voice_router
from routes.essay_routes import router as essay_router, set_db as set_essay_db
from routes.note_routes import router as note_router, set_db as set_note_db
from routes.test_routes import router as test_router, set_db as set_test_db
from routes.doubt_routes import router as doubt_router, set_db as set_doubt_db
from routes.mentor_routes import router as mentor_router, set_db as set_mentor_db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="UPSC Preparation App API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "UPSC Preparation App API", "version": "1.0.0", "status": "active"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Set database for all route modules
set_answer_db(db)
set_mcq_db(db)
set_progress_db(db)
set_essay_db(db)
set_note_db(db)
set_test_db(db)
set_doubt_db(db)
set_mentor_db(db)

# Include all routers
api_router.include_router(answer_router)
api_router.include_router(mcq_router)
api_router.include_router(progress_router)
api_router.include_router(voice_router)
api_router.include_router(essay_router)
api_router.include_router(note_router)
api_router.include_router(test_router)
api_router.include_router(doubt_router)
api_router.include_router(mentor_router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Initialize sample data on startup
@app.on_event("startup")
async def initialize_sample_data():
    """Initialize sample questions in database if not exists"""
    try:
        from utils.sample_data import get_all_sample_questions
        from models.question import Question
        
        # Check if questions already exist
        count = await db.questions.count_documents({})
        
        if count == 0:
            logger.info("Initializing sample questions...")
            sample_questions = get_all_sample_questions()
            
            # Convert to Question objects and insert
            for q_data in sample_questions:
                question = Question(**q_data)
                q_dict = question.model_dump()
                q_dict['created_at'] = q_dict['created_at'].isoformat()
                await db.questions.insert_one(q_dict)
            
            logger.info(f"Inserted {len(sample_questions)} sample questions")
        else:
            logger.info(f"Database already has {count} questions")
    except Exception as e:
        logger.error(f"Error initializing sample data: {e}")
