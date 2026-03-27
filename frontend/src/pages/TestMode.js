import React, { useState } from 'react';
import { testAPI } from '@/services/api';
import { Clock, Play, CheckCircle } from 'lucide-react';

const TestMode = ({ userId, language }) => {
  const [testType, setTestType] = useState('custom');
  const [loading, setLoading] = useState(false);

  const handleCreateMockTest = async (paperType) => {
    setLoading(true);
    try {
      const response = await testAPI.createMockTest(userId, paperType);
      alert(`Mock test created! ${response.questions.length} questions, Duration: ${response.duration_minutes} minutes`);
    } catch (error) {
      console.error('Error creating mock test:', error);
      alert('Failed to create mock test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" data-testid="test-mode-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
          <Clock className="h-8 w-8 text-blue-600" />
          <span>Test Mode</span>
        </h1>
        <p className="text-gray-600 mt-1">Practice with timed tests</p>
      </div>

      {/* Mock Tests */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h3 className="text-xl font-semibold mb-4">Mock Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['GS1', 'GS2', 'GS3', 'GS4', 'CSAT'].map(paper => (
            <button
              key={paper}
              onClick={() => handleCreateMockTest(paper)}
              disabled={loading}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{paper} Mock Test</p>
                  <p className="text-sm text-gray-600">Full paper simulation</p>
                </div>
                <Play className="h-6 w-6 text-gray-400 group-hover:text-blue-600" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">Test Features</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Real exam simulation with timer</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Subject-wise and full paper tests</span>
          </li>
          <li className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <span>Detailed performance analysis</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TestMode;