'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';

const mentalHealthTips = [
  {
    title: 'Regular Exercise',
    description: 'Jogging helps relieve mental stress and boosts endorphins',
    emoji: '🏃',
    color: 'from-green-400 to-emerald-500',
  },
  {
    title: 'Mindful Breathing',
    description: 'Deep breathing exercises can calm anxiety and improve focus',
    emoji: '🧘',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    title: 'Quality Sleep',
    description: 'Getting 7-9 hours of sleep improves mental clarity and mood',
    emoji: '😴',
    color: 'from-purple-400 to-indigo-500',
  },
  {
    title: 'Social Connection',
    description: 'Spending time with loved ones strengthens emotional wellbeing',
    emoji: '🤝',
    color: 'from-pink-400 to-rose-500',
  },
];

export default function MoodDashboard() {
  const { user, setMoodDashboardCompleted } = useAuthStore();
  const [dayRating, setDayRating] = useState(5);
  const [feelingScale, setFeelingScale] = useState(3);
  const [currentTip, setCurrentTip] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleSubmit = () => {
    // Save mood ratings and proceed to chat
    console.log('Mood Dashboard:', { dayRating, feelingScale });
    setMoodDashboardCompleted(true);
  };

  const nextTip = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev + 1) % mentalHealthTips.length);
      setAnimating(false);
    }, 300);
  };

  const prevTip = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentTip((prev) => (prev - 1 + mentalHealthTips.length) % mentalHealthTips.length);
      setAnimating(false);
    }, 300);
  };

  const tip = mentalHealthTips[currentTip];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <svg
              className="w-16 h-16 text-purple-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome back, {user?.name}! 👋</h1>
          <p className="text-gray-600 text-lg">Let's check in on how you're feeling today</p>
        </div>

        {/* Mood Rating Cards */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 mb-6">
          {/* Day Rating */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              Rate your day out of 10
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={dayRating}
                onChange={(e) => setDayRating(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-300 via-yellow-300 to-green-300 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fca5a5 0%, #fde047 50%, #86efac 100%)`,
                }}
                data-testid="day-rating-slider"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">1</span>
                <div className="flex items-center gap-2">
                  <span className="text-5xl animate-bounce">{dayRating >= 7 ? '😊' : dayRating >= 4 ? '😐' : '😔'}</span>
                  <span className="text-3xl font-bold text-purple-600">{dayRating}</span>
                </div>
                <span className="text-sm text-gray-500">10</span>
              </div>
            </div>
          </div>

          {/* Feeling Scale */}
          <div>
            <label className="block text-lg font-semibold text-gray-800 mb-4">
              How are you feeling on a scale of 5?
            </label>
            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="5"
                value={feelingScale}
                onChange={(e) => setFeelingScale(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-blue-300 to-indigo-300 rounded-lg appearance-none cursor-pointer"
                data-testid="feeling-scale-slider"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Very Low</span>
                <div className="flex items-center gap-2">
                  <span className="text-5xl animate-pulse">
                    {feelingScale === 5 ? '🤗' : feelingScale === 4 ? '😊' : feelingScale === 3 ? '😐' : feelingScale === 2 ? '😕' : '😢'}
                  </span>
                  <span className="text-3xl font-bold text-indigo-600">{feelingScale}</span>
                </div>
                <span className="text-sm text-gray-500">Very High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mental Health Tips */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">💡 Mental Wellbeing Tips</h2>
          
          <div className={`transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className={`bg-gradient-to-r ${tip.color} rounded-xl p-8 text-white shadow-lg relative overflow-hidden`}>
              {/* Animated background */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-64 h-64 bg-white rounded-full -top-32 -left-32 animate-pulse"></div>
                <div className="absolute w-64 h-64 bg-white rounded-full -bottom-32 -right-32 animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-6xl animate-bounce" style={{ animationDuration: '2s' }}>{tip.emoji}</span>
                  <h3 className="text-2xl font-bold">{tip.title}</h3>
                </div>
                <p className="text-lg leading-relaxed">{tip.description}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={prevTip}
              className="p-3 bg-white hover:bg-gray-100 rounded-full shadow-md transition-all hover:scale-110"
              data-testid="prev-tip-btn"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-2">
              {mentalHealthTips.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentTip ? 'bg-purple-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextTip}
              className="p-3 bg-white hover:bg-gray-100 rounded-full shadow-md transition-all hover:scale-110"
              data-testid="next-tip-btn"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          data-testid="continue-to-chat-btn"
        >
          Continue to Chat 💬
        </button>
      </div>
    </div>
  );
}
