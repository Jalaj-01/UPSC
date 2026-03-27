from .answer_routes import router as answer_router, set_db as set_answer_db
from .mcq_routes import router as mcq_router, set_db as set_mcq_db
from .progress_routes import router as progress_router, set_db as set_progress_db
from .voice_routes import router as voice_router
from .essay_routes import router as essay_router, set_db as set_essay_db
from .note_routes import router as note_router, set_db as set_note_db
from .test_routes import router as test_router, set_db as set_test_db
from .doubt_routes import router as doubt_router, set_db as set_doubt_db
from .mentor_routes import router as mentor_router, set_db as set_mentor_db

__all__ = [
    'answer_router',
    'mcq_router',
    'progress_router',
    'voice_router',
    'essay_router',
    'note_router',
    'test_router',
    'doubt_router',
    'mentor_router',
    'set_answer_db',
    'set_mcq_db',
    'set_progress_db',
    'set_essay_db',
    'set_note_db',
    'set_test_db',
    'set_doubt_db',
    'set_mentor_db'
]