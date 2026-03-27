import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, CheckSquare, BookOpen, TestTube2, 
  NotepadText, TrendingUp, MessageCircle, Menu, X,
  PenTool, GraduationCap
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, userId }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/answer-generator', label: 'Answer Generator', icon: PenTool },
    { path: '/answer-evaluator', label: 'Answer Evaluator', icon: CheckSquare },
    { path: '/mcq-practice', label: 'MCQ Practice', icon: FileText },
    { path: '/test-mode', label: 'Test Mode', icon: TestTube2 },
    { path: '/essay-builder', label: 'Essay Builder', icon: BookOpen },
    { path: '/notes', label: 'Notes & Flashcards', icon: NotepadText },
    { path: '/progress', label: 'Progress Analytics', icon: TrendingUp },
    { path: '/doubts', label: 'Ask Doubts', icon: MessageCircle },
  ];

  return (
    <>
      {/* Sidebar */}
      <div
        data-testid="sidebar"
        className={`${
          isOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 bg-gradient-to-b from-indigo-600 to-indigo-800 text-white overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" />
              <span className="text-xl font-bold">UPSC Prep</span>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav data-testid="nav-menu" className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white text-indigo-600 font-semibold'
                      : 'hover:bg-indigo-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default Sidebar;