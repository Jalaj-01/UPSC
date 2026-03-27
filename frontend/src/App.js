import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';

// Layout
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

// Pages
import Dashboard from '@/pages/Dashboard';
import AnswerGenerator from '@/pages/AnswerGenerator';
import AnswerEvaluator from '@/pages/AnswerEvaluator';
import MCQPractice from '@/pages/MCQPractice';
import TestMode from '@/pages/TestMode';
import EssayBuilder from '@/pages/EssayBuilder';
import NotePlatform from '@/pages/NotePlatform';
import ProgressAnalytics from '@/pages/ProgressAnalytics';
import DoubtChat from '@/pages/DoubtChat';

// Demo user ID (since auth is skipped)
const DEMO_USER_ID = 'demo-user-123';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [language, setLanguage] = useState('english'); // english, hindi, mixed
  const [userId] = useState(DEMO_USER_ID);

  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          userId={userId}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Navbar */}
          <Navbar 
            language={language}
            setLanguage={setLanguage}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            userId={userId}
          />
          
          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <Routes>
              <Route path="/" element={<Dashboard userId={userId} language={language} />} />
              <Route path="/answer-generator" element={<AnswerGenerator userId={userId} language={language} />} />
              <Route path="/answer-evaluator" element={<AnswerEvaluator userId={userId} language={language} />} />
              <Route path="/mcq-practice" element={<MCQPractice userId={userId} language={language} />} />
              <Route path="/test-mode" element={<TestMode userId={userId} language={language} />} />
              <Route path="/essay-builder" element={<EssayBuilder userId={userId} language={language} />} />
              <Route path="/notes" element={<NotePlatform userId={userId} language={language} />} />
              <Route path="/progress" element={<ProgressAnalytics userId={userId} language={language} />} />
              <Route path="/doubts" element={<DoubtChat userId={userId} language={language} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;