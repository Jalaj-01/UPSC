import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mentorAPI, progressAPI, answerAPI, mcqAPI } from '@/services/api';
import { TrendingUp, BookOpen, Target, Flame, Award, ArrowRight } from 'lucide-react';

const Dashboard = ({ userId, language }) => {
  const [loading, setLoading] = useState(true);
  const [dailyPlan, setDailyPlan] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [recentStats, setRecentStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all dashboard data
      const [planData, gamData, alertData, metricsData] = await Promise.all([
        mentorAPI.getDailyPlan(userId).catch(() => null),
        mentorAPI.getGamificationData(userId).catch(() => null),
        progressAPI.getAlerts(userId).catch(() => null),
        progressAPI.getMetrics(userId, 7).catch(() => null)
      ]);

      setDailyPlan(planData);
      setGamification(gamData);
      setAlerts(alertData?.alerts || []);
      setRecentStats(metricsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
        <p className="text-gray-600 mt-1">Let's continue your UPSC preparation journey</p>
      </div>

      {/* Gamification Stats */}
      {gamification && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Current Streak</p>
                <p className="text-4xl font-bold mt-2" data-testid="dashboard-streak">{gamification.streak_days}</p>
                <p className="text-orange-100 text-sm mt-1">days</p>
              </div>
              <Flame className="h-16 w-16 text-orange-200" />
            </div>
          </div>

          {/* Level Card */}
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Mentor Level</p>
                <p className="text-4xl font-bold mt-2" data-testid="dashboard-level">{gamification.mentor_level}</p>
                <p className="text-purple-100 text-sm mt-1">level</p>
              </div>
              <Award className="h-16 w-16 text-purple-200" />
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Average Score</p>
                <p className="text-4xl font-bold mt-2">
                  {recentStats?.metrics?.overall_avg?.toFixed(1) || '0.0'}
                </p>
                <p className="text-green-100 text-sm mt-1">out of 10</p>
              </div>
              <TrendingUp className="h-16 w-16 text-green-200" />
            </div>
          </div>
        </div>
      )}

      {/* Progress Bars */}
      {gamification?.progress_bars && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Weekly Goals</h2>
          <div className="space-y-4">
            {/* Answers Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Answers Written</span>
                <span className="font-medium">
                  {gamification.progress_bars.answers_this_week.current} / {gamification.progress_bars.answers_this_week.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${gamification.progress_bars.answers_this_week.percentage}%` }}
                />
              </div>
            </div>

            {/* MCQs Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">MCQs Attempted</span>
                <span className="font-medium">
                  {gamification.progress_bars.mcqs_this_week.current} / {gamification.progress_bars.mcqs_this_week.target}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${gamification.progress_bars.mcqs_this_week.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Progress Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'achievement' ? 'bg-green-50 border-green-500' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  alert.type === 'error' ? 'bg-red-50 border-red-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <p className="text-gray-800">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Daily Plan */}
      {dailyPlan?.plan && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-md border border-indigo-100">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-6 w-6 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Today's AI Mentor Plan</h2>
          </div>
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700 whitespace-pre-line">{dailyPlan.plan}</p>
          </div>
          {dailyPlan.weak_areas?.length > 0 && (
            <div className="mt-4 pt-4 border-t border-indigo-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Focus Areas:</p>
              <div className="flex flex-wrap gap-2">
                {dailyPlan.weak_areas.map((area, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/answer-generator"
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
          >
            <div>
              <p className="font-medium text-gray-900">Generate Answer</p>
              <p className="text-sm text-gray-600">AI-powered answer writing</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600" />
          </Link>

          <Link
            to="/mcq-practice"
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
          >
            <div>
              <p className="font-medium text-gray-900">Practice MCQs</p>
              <p className="text-sm text-gray-600">Subject-wise practice</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
          </Link>

          <Link
            to="/answer-evaluator"
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
          >
            <div>
              <p className="font-medium text-gray-900">Evaluate Answer</p>
              <p className="text-sm text-gray-600">Get AI feedback</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
          </Link>

          <Link
            to="/progress"
            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
          >
            <div>
              <p className="font-medium text-gray-900">View Progress</p>
              <p className="text-sm text-gray-600">Analytics & insights</p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
          </Link>
        </div>
      </div>

      {/* Achievements */}
      {gamification?.achievements?.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gamification.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <span className="text-3xl">{achievement.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{achievement.title}</p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;