import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Answer APIs
export const answerAPI = {
  generateAnswer: async (question, language = 'english') => {
    const response = await axios.post(`${API}/answers/generate`, { question, language });
    return response.data;
  },
  
  evaluateAnswer: async (question, answer, language = 'english') => {
    const response = await axios.post(`${API}/answers/evaluate`, { question, answer, language });
    return response.data;
  },
  
  getUserAnswers: async (userId, limit = 20) => {
    const response = await axios.get(`${API}/answers/user/${userId}?limit=${limit}`);
    return response.data;
  },
  
  getFeedbackHistory: async (userId, limit = 10) => {
    const response = await axios.get(`${API}/answers/feedback/${userId}?limit=${limit}`);
    return response.data;
  }
};

// MCQ APIs
export const mcqAPI = {
  getQuestions: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API}/mcq/questions?${params}`);
    return response.data;
  },
  
  getSubjects: async () => {
    const response = await axios.get(`${API}/mcq/subjects`);
    return response.data;
  },
  
  getTopics: async (subject) => {
    const response = await axios.get(`${API}/mcq/topics/${subject}`);
    return response.data;
  },
  
  getDailyTask: async (count = 10, subjects = null, difficulty = null) => {
    const response = await axios.post(`${API}/mcq/daily-task`, { count, subjects, difficulty });
    return response.data;
  },
  
  submitAnswer: async (userId, questionId, answer, question, correctAnswer) => {
    const response = await axios.post(`${API}/mcq/submit`, {
      user_id: userId,
      question_id: questionId,
      answer,
      question,
      correct_answer: correctAnswer
    });
    return response.data;
  },
  
  getWrongQuestions: async (userId) => {
    const response = await axios.get(`${API}/mcq/wrong-questions/${userId}`);
    return response.data;
  }
};

// Progress APIs
export const progressAPI = {
  updateProgress: async (progressData) => {
    const response = await axios.post(`${API}/progress/update`, progressData);
    return response.data;
  },
  
  getUserProgress: async (userId, days = 30) => {
    const response = await axios.get(`${API}/progress/user/${userId}?days=${days}`);
    return response.data;
  },
  
  getMetrics: async (userId, days = 7) => {
    const response = await axios.get(`${API}/progress/metrics/${userId}?days=${days}`);
    return response.data;
  },
  
  getAlerts: async (userId) => {
    const response = await axios.get(`${API}/progress/alerts/${userId}`);
    return response.data;
  },
  
  getChartData: async (userId, days = 7) => {
    const response = await axios.get(`${API}/progress/chart-data/${userId}?days=${days}`);
    return response.data;
  },
  
  getReadiness: async (userId) => {
    const response = await axios.get(`${API}/progress/readiness/${userId}`);
    return response.data;
  }
};

// Voice APIs
export const voiceAPI = {
  transcribe: async (audioBlob, language = 'en') => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    const response = await axios.post(`${API}/voice/transcribe?language=${language}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  
  textToSpeech: async (text, voice = 'alloy', language = 'en') => {
    const response = await axios.post(`${API}/voice/text-to-speech`, { text, voice, language }, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  getVoices: async () => {
    const response = await axios.get(`${API}/voice/voices`);
    return response.data;
  }
};

// Essay APIs
export const essayAPI = {
  generateOutline: async (topic, language = 'english') => {
    const response = await axios.post(`${API}/essay/outline`, { topic, language });
    return response.data;
  },
  
  evaluateEssay: async (topic, essay, language = 'english') => {
    const response = await axios.post(`${API}/essay/evaluate`, { topic, essay, language });
    return response.data;
  },
  
  getTopics: async () => {
    const response = await axios.get(`${API}/essay/topics`);
    return response.data;
  }
};

// Notes APIs
export const notesAPI = {
  createNote: async (noteData) => {
    const response = await axios.post(`${API}/notes/create`, noteData);
    return response.data;
  },
  
  getUserNotes: async (userId, subject = null, limit = 50) => {
    const params = subject ? `?subject=${subject}&limit=${limit}` : `?limit=${limit}`;
    const response = await axios.get(`${API}/notes/user/${userId}${params}`);
    return response.data;
  },
  
  updateNote: async (noteId, updateData) => {
    const response = await axios.put(`${API}/notes/update/${noteId}`, updateData);
    return response.data;
  },
  
  deleteNote: async (noteId) => {
    const response = await axios.delete(`${API}/notes/delete/${noteId}`);
    return response.data;
  },
  
  // Flashcards
  createFlashcard: async (flashcardData) => {
    const response = await axios.post(`${API}/notes/flashcards/create`, flashcardData);
    return response.data;
  },
  
  getUserFlashcards: async (userId, subject = null, limit = 50) => {
    const params = subject ? `?subject=${subject}&limit=${limit}` : `?limit=${limit}`;
    const response = await axios.get(`${API}/notes/flashcards/user/${userId}${params}`);
    return response.data;
  },
  
  reviewFlashcard: async (flashcardId, masteryLevel) => {
    const response = await axios.post(`${API}/notes/flashcards/review/${flashcardId}`, { mastery_level: masteryLevel });
    return response.data;
  },
  
  getDailyFlashcards: async (userId, count = 15) => {
    const response = await axios.get(`${API}/notes/flashcards/daily/${userId}?count=${count}`);
    return response.data;
  }
};

// Test APIs
export const testAPI = {
  createTest: async (testData) => {
    const response = await axios.post(`${API}/tests/create`, testData);
    return response.data;
  },
  
  submitTest: async (submission) => {
    const response = await axios.post(`${API}/tests/submit`, submission);
    return response.data;
  },
  
  getUserTests: async (userId, limit = 20) => {
    const response = await axios.get(`${API}/tests/user/${userId}?limit=${limit}`);
    return response.data;
  },
  
  createCustomTest: async (subjects, questionCount, questionType, userId) => {
    const response = await axios.post(`${API}/tests/custom`, {
      subjects,
      question_count: questionCount,
      question_type: questionType,
      user_id: userId
    });
    return response.data;
  },
  
  createMockTest: async (userId, paperType = 'GS1') => {
    const response = await axios.post(`${API}/tests/mock`, {
      user_id: userId,
      paper_type: paperType
    });
    return response.data;
  }
};

// Doubt APIs
export const doubtAPI = {
  askDoubt: async (userId, question, context = null) => {
    const response = await axios.post(`${API}/doubts/ask`, { user_id: userId, question, context });
    return response.data;
  },
  
  getHistory: async (userId, limit = 20) => {
    const response = await axios.get(`${API}/doubts/history/${userId}?limit=${limit}`);
    return response.data;
  }
};

// Mentor APIs
export const mentorAPI = {
  getDailyPlan: async (userId) => {
    const response = await axios.get(`${API}/mentor/daily-plan/${userId}`);
    return response.data;
  },
  
  getGamificationData: async (userId) => {
    const response = await axios.get(`${API}/mentor/gamification/${userId}`);
    return response.data;
  }
};

export default {
  answerAPI,
  mcqAPI,
  progressAPI,
  voiceAPI,
  essayAPI,
  notesAPI,
  testAPI,
  doubtAPI,
  mentorAPI
};
