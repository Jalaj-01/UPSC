import React, { useState, useEffect } from 'react';
import { mcqAPI } from '@/services/api';
import { BookOpen, CheckCircle2, XCircle, Loader2, Filter } from 'lucide-react';

const MCQPractice = ({ userId, language }) => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await mcqAPI.getSubjects();
      setSubjects(response.subjects || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchQuestions = async (subject) => {
    setLoading(true);
    try {
      const response = await mcqAPI.getQuestions({ subject, limit: 10 });
      setQuestions(response.questions || []);
      setCurrentIndex(0);
      setUserAnswers({});
      setShowResults(false);
      setResults({});
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubject(subject);
    if (subject) {
      fetchQuestions(subject);
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async () => {
    const newResults = {};
    
    for (const question of questions) {
      const questionId = question.id || question.question_text;
      const userAnswer = userAnswers[questionId];
      const isCorrect = userAnswer === question.correct_answer;
      
      newResults[questionId] = {
        isCorrect,
        userAnswer,
        correctAnswer: question.correct_answer,
        explanation: question.explanation
      };

      // Submit to backend
      try {
        await mcqAPI.submitAnswer(
          userId,
          questionId,
          userAnswer,
          question.question_text,
          question.correct_answer
        );
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }

    setResults(newResults);
    setShowResults(true);
  };

  const calculateScore = () => {
    const answered = Object.keys(userAnswers).length;
    const correct = Object.values(results).filter(r => r.isCorrect).length;
    return { answered, correct, total: questions.length };
  };

  const currentQuestion = questions[currentIndex];
  const questionId = currentQuestion?.id || currentQuestion?.question_text;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="mcq-practice-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          <span>MCQ Practice</span>
        </h1>
        <p className="text-gray-600 mt-1">Practice subject-wise questions with instant feedback</p>
      </div>

      {/* Subject Filter */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Subject
        </label>
        <select
          data-testid="subject-selector"
          value={selectedSubject}
          onChange={(e) => handleSubjectChange(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Choose a subject...</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Questions */}
      {questions.length > 0 && !showResults && (
        <>
          {/* Progress */}
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">
                Answered: {Object.keys(userAnswers).length}/{questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl p-8 shadow-md" data-testid="question-card">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                {currentQuestion.subject} - {currentQuestion.topic}
              </span>
              <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.question_text}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = userAnswers[questionId] === option;
                return (
                  <button
                    key={index}
                    data-testid={`option-${index}`}
                    onClick={() => handleAnswerSelect(questionId, option)}
                    className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  data-testid="submit-test-button"
                  onClick={handleSubmit}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-6" data-testid="results-section">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
            <div className="text-center">
              <p className="text-green-100 text-sm uppercase tracking-wide mb-2">Your Score</p>
              <p className="text-6xl font-bold mb-2">
                {calculateScore().correct}/{calculateScore().total}
              </p>
              <p className="text-xl text-green-100">
                {Math.round((calculateScore().correct / calculateScore().total) * 100)}% Correct
              </p>
            </div>
          </div>

          {/* Question Results */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4">Detailed Results</h3>
            <div className="space-y-4">
              {questions.map((question, index) => {
                const qId = question.id || question.question_text;
                const result = results[qId];
                const isCorrect = result?.isCorrect;

                return (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {isCorrect ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">
                          Q{index + 1}. {question.question_text}
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Your Answer:</span>{' '}
                            <span className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                              {result?.userAnswer || 'Not answered'}
                            </span>
                          </p>
                          {!isCorrect && (
                            <p>
                              <span className="font-medium">Correct Answer:</span>{' '}
                              <span className="text-green-700">{result?.correctAnswer}</span>
                            </p>
                          )}
                          {question.explanation && (
                            <p className="mt-2 text-gray-700">
                              <span className="font-medium">Explanation:</span> {question.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setShowResults(false);
                setUserAnswers({});
                setCurrentIndex(0);
                if (selectedSubject) {
                  fetchQuestions(selectedSubject);
                }
              }}
              className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Practice Again
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {questions.length === 0 && !loading && selectedSubject && (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No questions available for this subject</p>
        </div>
      )}

      {questions.length === 0 && !selectedSubject && !loading && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-12 text-center border border-indigo-200">
          <Filter className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-700 text-lg mb-2">Select a subject to start practicing</p>
          <p className="text-gray-600 text-sm">Choose from the dropdown above to begin</p>
        </div>
      )}
    </div>
  );
};

export default MCQPractice;