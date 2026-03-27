import React, { useState, useEffect } from 'react';
import { progressAPI } from '@/services/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, AlertTriangle, Award } from 'lucide-react';

const ProgressAnalytics = ({ userId, language }) => {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    fetchAnalytics();
  }, [userId, period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [chartResponse, metricsResponse, readinessResponse] = await Promise.all([
        progressAPI.getChartData(userId, period),
        progressAPI.getMetrics(userId, period),
        progressAPI.getReadiness(userId)
      ]);

      setChartData(chartResponse.chart_data || []);
      setMetrics(metricsResponse);
      setReadiness(readinessResponse.readiness);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (score) => {
    if (score >= 75) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 45) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="progress-analytics-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-indigo-600" />
            <span>Progress Analytics</span>
          </h1>
          <p className="text-gray-600 mt-1">Track your performance and improvement</p>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={14}>Last 14 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>

      {/* Exam Readiness */}
      {readiness && (
        <div className={`bg-gradient-to-br ${getReadinessColor(readiness.readiness_score)} rounded-xl p-8 text-white shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm uppercase tracking-wide mb-2">Exam Readiness</p>
              <p className="text-6xl font-bold mb-2">{readiness.readiness_score.toFixed(0)}%</p>
              <p className="text-2xl text-white/90 mb-4">{readiness.readiness_level}</p>
              <p className="text-white/80">{readiness.message}</p>
            </div>
            <Target className="h-24 w-24 text-white/30" />
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {metrics?.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-2">Structure</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.metrics.structure_avg.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">out of 10</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-2">Content</p>
            <p className="text-3xl font-bold text-green-600">{metrics.metrics.content_avg.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">out of 10</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-2">Depth</p>
            <p className="text-3xl font-bold text-purple-600">{metrics.metrics.depth_avg.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">out of 10</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <p className="text-gray-600 text-sm mb-2">Keywords</p>
            <p className="text-3xl font-bold text-orange-600">{metrics.metrics.keyword_avg.toFixed(1)}</p>
            <p className="text-gray-500 text-xs mt-1">out of 10</p>
          </div>
        </div>
      )}

      {/* Improvement Trend */}
      {metrics?.improvement && (
        <div className={`rounded-xl p-6 border-2 ${
          metrics.improvement.trend === 'improving' ? 'bg-green-50 border-green-300' :
          metrics.improvement.trend === 'declining' ? 'bg-red-50 border-red-300' :
          'bg-blue-50 border-blue-300'
        }`}>
          <div className="flex items-center space-x-3">
            {metrics.improvement.trend === 'improving' ? (
              <Award className="h-8 w-8 text-green-600" />
            ) : metrics.improvement.trend === 'declining' ? (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            ) : (
              <TrendingUp className="h-8 w-8 text-blue-600" />
            )}
            <div>
              <p className="font-semibold text-gray-900 text-lg">{metrics.improvement.message}</p>
              <p className="text-sm text-gray-600">Based on your last {period} days performance</p>
            </div>
          </div>
        </div>
      )}

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-6">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="structure" stroke="#3b82f6" name="Structure" />
              <Line type="monotone" dataKey="content" stroke="#10b981" name="Content" />
              <Line type="monotone" dataKey="depth" stroke="#8b5cf6" name="Depth" />
              <Line type="monotone" dataKey="keywords" stroke="#f97316" name="Keywords" />
              <Line type="monotone" dataKey="overall" stroke="#ef4444" strokeWidth={2} name="Overall" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category Comparison */}
      {metrics?.metrics && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-6">Category Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { name: 'Structure', score: metrics.metrics.structure_avg },
              { name: 'Content', score: metrics.metrics.content_avg },
              { name: 'Depth', score: metrics.metrics.depth_avg },
              { name: 'Keywords', score: metrics.metrics.keyword_avg }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Bar dataKey="score" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty State */}
      {chartData.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg mb-2">No data available yet</p>
          <p className="text-gray-500 text-sm">Start practicing to see your progress analytics</p>
        </div>
      )}
    </div>
  );
};

export default ProgressAnalytics;