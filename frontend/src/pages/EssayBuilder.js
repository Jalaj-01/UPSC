import React, { useState } from 'react';
import { essayAPI } from '@/services/api';
import { FileText, Lightbulb, Loader2, CheckCircle2 } from 'lucide-react';

const EssayBuilder = ({ userId, language }) => {
  const [topic, setTopic] = useState('');
  const [outline, setOutline] = useState('');
  const [essay, setEssay] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('write'); // write or evaluate

  const handleGenerateOutline = async () => {
    if (!topic.trim()) {
      alert('Please enter an essay topic');
      return;
    }

    setLoading(true);
    try {
      const response = await essayAPI.generateOutline(topic, language);
      setOutline(response.outline);
    } catch (error) {
      console.error('Error generating outline:', error);
      alert('Failed to generate outline');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!topic.trim() || !essay.trim()) {
      alert('Please enter both topic and essay');
      return;
    }

    setLoading(true);
    try {
      const response = await essayAPI.evaluateEssay(topic, essay, language);
      setEvaluation(response.evaluation);
      setActiveTab('evaluate');
    } catch (error) {
      console.error('Error evaluating essay:', error);
      alert('Failed to evaluate essay');
    } finally {
      setLoading(false);
    }
  };

  const wordCount = essay.split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6" data-testid="essay-builder-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <FileText className="h-8 w-8 text-indigo-600" />
          <span>Essay Builder</span>
        </h1>
        <p className="text-gray-600 mt-1">AI-powered essay writing assistance</p>
      </div>

      {/* Topic Input */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <label className="block text-sm font-medium text-gray-700 mb-2">Essay Topic</label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Technology: A boon or a bane"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleGenerateOutline}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center space-x-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lightbulb className="h-5 w-5" />}
          <span>Generate Outline</span>
        </button>
      </div>

      {/* Outline */}
      {outline && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-3">AI-Generated Outline</h3>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">{outline}</div>
        </div>
      )}

      {/* Essay Editor */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Write Your Essay</label>
          <span className="text-sm text-gray-500">Words: {wordCount}/1000-1200</span>
        </div>
        <textarea
          value={essay}
          onChange={(e) => setEssay(e.target.value)}
          placeholder="Start writing your essay here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={20}
        />
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          <span>Evaluate Essay</span>
        </button>
      </div>

      {/* Evaluation */}
      {evaluation && (
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-8 text-white shadow-lg">
          <div className="text-center">
            <p className="text-green-100 text-sm uppercase tracking-wide mb-2">Overall Score</p>
            <p className="text-6xl font-bold mb-2">{evaluation.overall_score.toFixed(1)}</p>
            <p className="text-xl text-green-100">out of 10</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayBuilder;