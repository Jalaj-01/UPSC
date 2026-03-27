import React, { useState } from 'react';
import { answerAPI } from '@/services/api';
import { CheckCircle2, Loader2, Mic, MicOff, AlertCircle } from 'lucide-react';

const AnswerEvaluator = ({ userId, language }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleEvaluate = async () => {
    if (!question.trim() || !answer.trim()) {
      alert('Please enter both question and answer');
      return;
    }

    setLoading(true);
    try {
      const response = await answerAPI.evaluateAnswer(question, answer, language);
      setEvaluation(response.evaluation);
    } catch (error) {
      console.error('Error evaluating answer:', error);
      alert('Failed to evaluate answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="answer-evaluator-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
          <span>Answer Evaluator</span>
        </h1>
        <p className="text-gray-600 mt-1">Get detailed AI feedback on your answers</p>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
        {/* Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question
          </label>
          <textarea
            data-testid="question-input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question you're answering..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            rows={3}
          />
        </div>

        {/* Answer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Your Answer
            </label>
            <button
              onClick={() => setIsRecording(!isRecording)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Voice Input</span>
                </>
              )}
            </button>
          </div>
          <textarea
            data-testid="answer-input"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your answer here... (Minimum 100 words recommended)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
            rows={12}
          />
          <div className="text-sm text-gray-500 mt-2">
            Word count: {answer.split(/\s+/).filter(w => w.length > 0).length}
          </div>
        </div>

        <button
          data-testid="evaluate-button"
          onClick={handleEvaluate}
          disabled={loading || !question.trim() || !answer.trim()}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Evaluating...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              <span>Evaluate Answer</span>
            </>
          )}
        </button>
      </div>

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-6" data-testid="evaluation-results">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
            <div className="text-center">
              <p className="text-indigo-100 text-sm uppercase tracking-wide mb-2">Overall Score</p>
              <p className="text-6xl font-bold mb-2">{evaluation.overall_score.toFixed(1)}</p>
              <p className="text-xl text-indigo-100">out of 10</p>
              <div className="mt-4">
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  getScoreColor(evaluation.overall_score)
                }`}>
                  {getScoreLabel(evaluation.overall_score)}
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Scores */}
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Detailed Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Structure Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Structure</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.structure_score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${(evaluation.structure_score / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Content Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Content</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.content_score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${(evaluation.content_score / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Depth Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Depth & Analysis</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.depth_score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${(evaluation.depth_score / 10) * 100}%` }}
                  />
                </div>
              </div>

              {/* Keyword Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-700 font-medium">Keywords</span>
                  <span className="text-lg font-bold text-gray-900">{evaluation.keyword_score}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-orange-600 h-3 rounded-full transition-all"
                    style={{ width: `${(evaluation.keyword_score / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Strengths */}
          {evaluation.strengths?.length > 0 && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>Strengths</span>
              </h3>
              <ul className="space-y-2">
                {evaluation.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-green-800">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weaknesses */}
          {evaluation.weaknesses?.length > 0 && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Areas for Improvement</span>
              </h3>
              <ul className="space-y-2">
                {evaluation.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-800">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {evaluation.suggestions?.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Suggestions for Improvement</h3>
              <ul className="space-y-2">
                {evaluation.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-blue-800">
                    <span className="text-blue-600 mt-1">💡</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improved Version */}
          {evaluation.improved_answer && (
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-3">Enhanced Version</h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-purple-800 whitespace-pre-line">{evaluation.improved_answer}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnswerEvaluator;