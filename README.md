# 🎓 UPSC Preparation App

A comprehensive, AI-powered UPSC exam preparation platform with answer generation, MCQ practice, progress tracking, and personalized mentoring.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Usage Guide](#usage-guide)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

---

## ✨ Features

### 🤖 AI-Powered Answer System
- **Answer Generator**: AI generates structured GS answers (Intro, Body, Conclusion)
- **Answer Evaluator**: Evaluates answers on structure, content, depth, and keywords
- **Voice Input/Output**: Speak questions and get voice responses in Hindi/English
- **Feedback Tracker**: Stores previous evaluations and suggestions

### 📝 MCQ Practice System
- **Subject-wise PYQs**: Organized by History, Geography, Polity, Economics, etc.
- **Topic-wise Practice**: Filter questions by specific topics
- **Year-wise Papers**: Practice previous year questions
- **Daily Task Sets**: Auto-generated sets of 10/20/30 questions
- **Smart Revise Mode**: Re-attempt only incorrect questions
- **AI Explanations**: Detailed explanations for each MCQ

### 📊 Progress Tracking & Analytics
- **Performance Charts**: Track improvement in structure, content, depth, keywords
- **Progress Alerts**: Notifications for consistent improvement or repeated mistakes
- **Weak Areas Identification**: AI identifies areas needing attention
- **Exam Readiness Predictor**: Calculates readiness score based on performance
- **7-day Performance Tracking**: Week-over-week improvement analysis

### 🎮 Gamification
- **Streak System**: Daily practice streaks with fire emoji 🔥
- **Mentor Levels**: Progress through levels based on answers written
- **Progress Bars**: Visual tracking of weekly goals
- **Achievements**: Unlock badges for milestones

### 📚 Study Tools
- **Essay Builder**: AI generates outlines and evaluates essays
- **Note Platform**: Create notes with AI auto-summarization
- **Flashcards**: Spaced repetition system with mastery levels
- **Voice Notes**: Record and store voice summaries

### 🧪 Test System
- **Custom Tests**: Create tests from selected subjects and topics
- **Mock Tests**: Full-length UPSC simulation with timer
- **Timer Mode**: Practice with real exam time constraints
- **Revision Tests**: Auto-generated from wrong answers

### 💬 AI Mentor
- **Daily Study Plan**: Personalized recommendations based on weak areas
- **Doubt Chat**: Ask any doubt and get AI-powered answers
- **Performance Insights**: AI analyzes patterns and suggests improvements

### 🌐 Language Support
- **English**: Full English interface
- **Hindi**: Complete Hindi support (हिंदी)
- **Hinglish**: Mixed Hindi-English (code-mixing)

---

## 🛠 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB with Motor (async driver)
- **AI Integration**: 
  - OpenAI GPT-4o (text generation, evaluation)
  - OpenAI Whisper (speech-to-text)
  - OpenAI TTS (text-to-speech)
- **Key Libraries**:
  - `emergentintegrations` - Unified AI API interface
  - `pydantic` - Data validation
  - `motor` - Async MongoDB driver
  - `httpx` - Async HTTP client

### Frontend
- **Framework**: React 19
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Yarn** - Install via `npm install -g yarn`
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas (cloud)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd upsc-prep-app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
yarn install
```

---

## ⚙️ Environment Setup

### Backend Environment Variables

Create a `.env` file in the `/backend` directory:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=upsc_prep_db

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:8001

# AI Integration (Emergent LLM Key)
EMERGENT_LLM_KEY=sk-emergent-398Bc249eAaB939A70
```

**Note**: The provided `EMERGENT_LLM_KEY` is a universal key that works for:
- OpenAI GPT models (text generation)
- OpenAI Whisper (speech-to-text)
- OpenAI TTS (text-to-speech)

If you want to use your own API keys:
- Replace `EMERGENT_LLM_KEY` with `OPENAI_API_KEY=your-key-here`

### Frontend Environment Variables

Create a `.env` file in the `/frontend` directory:

```env
REACT_APP_BACKEND_URL=http://localhost:8001
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=false
```

---

## 🏃 Running the Application

### Start MongoDB

Make sure MongoDB is running:

```bash
# If installed locally:
mongod

# If using MongoDB Atlas, ensure your connection string is in backend/.env
```

### Start Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will be available at: `http://localhost:8001`

API Documentation: `http://localhost:8001/docs` (FastAPI auto-generated)

### Start Frontend Server

```bash
cd frontend
yarn start
```

Frontend will be available at: `http://localhost:3000`

---

## 📁 Project Structure

```
upsc-prep-app/
│
├── backend/
│   ├── server.py                 # Main FastAPI application
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables
│   │
│   ├── models/                   # Pydantic models (7 files)
│   │   ├── __init__.py
│   │   ├── user.py              # User model with streak, level
│   │   ├── question.py          # Question model (MCQ, subjective, essay)
│   │   ├── answer.py            # Answer model with evaluation
│   │   ├── test.py              # Test model (practice, mock)
│   │   ├── progress.py          # Progress tracking model
│   │   └── note.py              # Note and Flashcard models
│   │
│   ├── routes/                   # API route handlers (9 modules)
│   │   ├── __init__.py
│   │   ├── answer_routes.py     # Answer generation & evaluation
│   │   ├── mcq_routes.py        # MCQ practice & submissions
│   │   ├── progress_routes.py   # Progress tracking & analytics
│   │   ├── voice_routes.py      # Voice transcription & TTS
│   │   ├── essay_routes.py      # Essay outline & evaluation
│   │   ├── note_routes.py       # Notes & flashcards CRUD
│   │   ├── test_routes.py       # Test creation & submission
│   │   ├── doubt_routes.py      # Doubt chat AI
│   │   └── mentor_routes.py     # AI mentor & gamification
│   │
│   ├── services/                 # Business logic (5 services)
│   │   ├── __init__.py
│   │   ├── ai_service.py        # OpenAI GPT integration
│   │   ├── voice_service.py     # Whisper & TTS integration
│   │   ├── evaluation_service.py # Answer evaluation logic
│   │   ├── progress_service.py  # Progress calculation
│   │   └── question_service.py  # Question management
│   │
│   └── utils/                    # Utility functions
│       ├── __init__.py
│       ├── sample_data.py       # 20+ sample UPSC questions
│       └── helpers.py           # Helper functions
│
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── App.js               # Main React component with routing
│   │   ├── App.css              # Global styles
│   │   ├── index.js             # React entry point
│   │   ├── index.css            # Tailwind imports
│   │   │
│   │   ├── pages/               # Page components (TO BE BUILT)
│   │   │   ├── Dashboard.js
│   │   │   ├── AnswerGenerator.js
│   │   │   ├── AnswerEvaluator.js
│   │   │   ├── MCQPractice.js
│   │   │   ├── TestMode.js
│   │   │   ├── EssayBuilder.js
│   │   │   ├── NotePlatform.js
│   │   │   ├── ProgressAnalytics.js
│   │   │   └── DoubtChat.js
│   │   │
│   │   ├── components/          # Reusable components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.js    # ✅ Top navigation with language selector
│   │   │   │   └── Sidebar.js   # ✅ Side navigation menu
│   │   │   ├── answer/          # TO BE BUILT
│   │   │   ├── mcq/             # TO BE BUILT
│   │   │   ├── progress/        # TO BE BUILT
│   │   │   ├── essay/           # TO BE BUILT
│   │   │   ├── notes/           # TO BE BUILT
│   │   │   └── ui/              # shadcn/ui components
│   │   │
│   │   ├── services/
│   │   │   └── api.js           # ✅ Centralized API calls (50+ functions)
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   └── lib/                 # Utilities
│   │
│   ├── package.json             # Node dependencies
│   ├── .env                     # Environment variables
│   ├── tailwind.config.js       # Tailwind configuration
│   └── postcss.config.js        # PostCSS configuration
│
└── README.md                     # This file
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8001/api
```

### Quick API Reference

#### Answer APIs
- `POST /api/answers/generate` - Generate AI answer
- `POST /api/answers/evaluate` - Evaluate user's answer
- `GET /api/answers/user/{user_id}` - Get user's answers
- `GET /api/answers/feedback/{user_id}` - Get feedback history

#### MCQ APIs
- `GET /api/mcq/questions` - Get MCQ questions with filters
- `GET /api/mcq/subjects` - Get all subjects
- `GET /api/mcq/topics/{subject}` - Get topics for a subject
- `POST /api/mcq/daily-task` - Generate daily practice set
- `POST /api/mcq/submit` - Submit MCQ answer
- `GET /api/mcq/wrong-questions/{user_id}` - Get wrong answers

#### Progress APIs
- `POST /api/progress/update` - Update daily progress
- `GET /api/progress/metrics/{user_id}` - Get performance metrics
- `GET /api/progress/alerts/{user_id}` - Get progress alerts
- `GET /api/progress/chart-data/{user_id}` - Get chart data
- `GET /api/progress/readiness/{user_id}` - Get exam readiness score

#### Voice APIs
- `POST /api/voice/transcribe` - Transcribe audio to text
- `POST /api/voice/text-to-speech` - Convert text to speech
- `GET /api/voice/voices` - Get available TTS voices

#### Essay APIs
- `POST /api/essay/outline` - Generate essay outline
- `POST /api/essay/evaluate` - Evaluate essay
- `GET /api/essay/topics` - Get essay topics

#### Notes APIs
- `POST /api/notes/create` - Create note
- `GET /api/notes/user/{user_id}` - Get user notes
- `PUT /api/notes/update/{note_id}` - Update note
- `DELETE /api/notes/delete/{note_id}` - Delete note
- `POST /api/notes/flashcards/create` - Create flashcard
- `GET /api/notes/flashcards/daily/{user_id}` - Get daily flashcards

#### Test APIs
- `POST /api/tests/custom` - Create custom test
- `POST /api/tests/mock` - Create mock test
- `POST /api/tests/submit` - Submit test
- `GET /api/tests/user/{user_id}` - Get user tests

#### Doubt APIs
- `POST /api/doubts/ask` - Ask a doubt
- `GET /api/doubts/history/{user_id}` - Get doubt history

#### Mentor APIs
- `GET /api/mentor/daily-plan/{user_id}` - Get daily AI plan
- `GET /api/mentor/gamification/{user_id}` - Get gamification data

**Full API Documentation**: Visit `http://localhost:8001/docs` for interactive API docs (FastAPI auto-generated)

---

## 📖 Usage Guide

### Quick Start

1. **Start the servers** (see Running the Application section above)
2. **Open browser** to `http://localhost:3000`
3. **You'll see the Dashboard** (once frontend is complete)
4. **Demo User ID**: `demo-user-123` (no auth required)

### API Testing with cURL

#### Test Answer Generation
```bash
curl -X POST http://localhost:8001/api/answers/generate \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Discuss the role of Indian National Congress in freedom struggle.",
    "language": "english"
  }'
```

#### Test MCQ Subjects
```bash
curl http://localhost:8001/api/mcq/subjects
```

#### Test Daily Task Generation
```bash
curl -X POST http://localhost:8001/api/mcq/daily-task \
  -H "Content-Type: application/json" \
  -d '{"count": 10, "subjects": ["History"], "difficulty": "medium"}'
```

---

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod --dbpath /path/to/data
```

**Module Not Found Error**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**AI API Errors**
- Check `EMERGENT_LLM_KEY` in `.env` file
- Verify you have internet connection
- Check API key balance/limits

### Frontend Issues

**Port Already in Use**
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Module Not Found**
```bash
# Clear cache and reinstall
rm -rf node_modules
yarn install
```

**API Connection Error**
- Verify backend is running on port 8001
- Check `REACT_APP_BACKEND_URL` in `/frontend/.env`
- Check browser console for CORS errors

---

## 🔮 Future Enhancements

### Immediate Next Steps
- [ ] Complete all 9 frontend page components
- [ ] Build feature-specific UI components
- [ ] Add charts and visualizations
- [ ] Implement voice recording UI
- [ ] Create flashcard flip animations

### Planned Features
- [ ] User authentication (JWT + OAuth)
- [ ] PDF upload for handwritten answer evaluation (OCR)
- [ ] Peer comparison analytics
- [ ] Offline mode with data sync
- [ ] Mobile app (React Native)
- [ ] WhatsApp/Telegram bot integration
- [ ] Live doubt sessions with experts
- [ ] Current affairs daily feed
- [ ] Video explanation integration
- [ ] Community discussion forums

---

## 📝 Sample Data

The app comes with **20+ sample questions** across subjects:

- **History** (2 MCQs, 2 subjective): Indian National Movement, Revolt of 1857
- **Geography** (2 MCQs): Indian Geography, Physical Geography
- **Polity** (2 MCQs, 1 subjective): Constitutional Bodies, Fundamental Rights
- **Economics** (2 MCQs): Monetary Economics, Public Finance
- **Environment** (2 MCQs, 1 subjective): Climate Change, Biodiversity
- **Science & Technology** (2 MCQs): Biotechnology, Space Technology
- **Essay Topics** (3): Technology, Youth, Gandhian principles

---

## 🔑 API Key Information

### Emergent LLM Key (Provided)
- **Key**: `sk-emergent-398Bc249eAaB939A70`
- **Works for**: OpenAI GPT-4o, Whisper, TTS
- **Cost**: Deducted from Emergent balance
- **Top-up**: Available in Emergent dashboard (Profile → Universal Key → Add Balance)

### Using Your Own Keys
Replace in `/backend/.env`:
```env
# Remove EMERGENT_LLM_KEY and add:
OPENAI_API_KEY=your-openai-key-here
```

Then update `/backend/services/ai_service.py` and `/backend/services/voice_service.py` to use `OPENAI_API_KEY` instead.

---

## 📊 Current Status

✅ **Backend**: 100% Complete  
- 7 database models
- 9 route modules  
- 40+ API endpoints
- AI integration (GPT-4o, Whisper, TTS)
- 20+ sample questions

🚧 **Frontend**: 15% Complete  
- ✅ App structure with routing
- ✅ API service layer (50+ functions)
- ✅ Layout components (Navbar, Sidebar)
- ❌ Page components (to be built)
- ❌ Feature UI components (to be built)

📝 **Documentation**: Complete  

---

## 📞 Support

For issues or questions:
1. Check this README's troubleshooting section
2. Review API documentation at `http://localhost:8001/docs`
3. Check code comments in source files
4. Verify environment variables are set correctly

---

## 🙏 Acknowledgments

- **OpenAI** - GPT-4o, Whisper, TTS APIs
- **FastAPI** - Modern Python web framework
- **React** - Frontend library
- **MongoDB** - Database
- **Tailwind CSS** - Styling framework
- **shadcn/ui** - UI components
- **Emergent** - AI integration platform

---

**Built with ❤️ for UPSC Aspirants**

*Last Updated: March 27, 2025*

---

## 💡 Developer Notes

### Adding New Questions
Edit `/backend/utils/sample_data.py` to add questions to:
- `SAMPLE_MCQ_QUESTIONS`
- `SAMPLE_SUBJECTIVE_QUESTIONS`
- `SAMPLE_ESSAY_TOPICS`

### Customizing AI Behavior
Modify system prompts in `/backend/services/ai_service.py`:
- `generate_answer()` - Answer generation style
- `evaluate_answer()` - Evaluation criteria
- `generate_essay_outline()` - Outline structure
- `answer_doubt()` - Doubt response style

### Database Collections Used
- `questions` - All questions (MCQ, subjective, essay)
- `answers` - User answers with evaluations
- `mcq_submissions` - MCQ attempt records
- `tests` - Created tests and submissions
- `progress` - Daily progress tracking
- `notes` - User notes
- `flashcards` - Flashcards for revision
- `doubt_chats` - Doubt Q&A history
- `users` - User data (streak, level, stats)

---

**Happy Coding & Best of Luck for UPSC! 🎯**
