import React, { useState, useEffect } from 'react';
import { Menu, Globe, Bell, User } from 'lucide-react';
import { mentorAPI } from '@/services/api';

const Navbar = ({ language, setLanguage, onMenuClick, userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [gamificationData, setGamificationData] = useState(null);

  useEffect(() => {
    fetchGamificationData();
  }, [userId]);

  const fetchGamificationData = async () => {
    try {
      const data = await mentorAPI.getGamificationData(userId);
      setGamificationData(data);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    }
  };

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'हिंदी' },
    { value: 'mixed', label: 'Hinglish' }
  ];

  return (
    <nav data-testid="navbar" className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            data-testid="menu-button"
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Center - Gamification Stats */}
        {gamificationData && (
          <div className="flex items-center space-x-6" data-testid="gamification-stats">
            {/* Streak */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-xs text-gray-500">Streak</p>
                <p className="text-sm font-semibold" data-testid="streak-days">
                  {gamificationData.streak_days} days
                </p>
              </div>
            </div>

            {/* Level */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-xs text-gray-500">Level</p>
                <p className="text-sm font-semibold" data-testid="mentor-level">
                  {gamificationData.mentor_level}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-gray-600" />
            <select
              data-testid="language-selector"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <button
            data-testid="notifications-button"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {/* User Profile */}
          <button
            data-testid="user-profile-button"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <User className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Demo User</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;