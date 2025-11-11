'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { MoodType } from '@/lib/api';

const moodThemes = {
  normal: {
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    bgGradient: 'from-indigo-50 via-purple-50 to-pink-50',
    cardBg: 'from-white to-indigo-50',
    emoji: '😊',
    title: 'You\'re doing great!',
    subtitle: 'Keep up the positive energy',
    message: 'Your mind seems balanced and calm. Continue practicing self-care and stay connected.',
    activities: [
      { icon: '🎨', title: 'Creative Expression', desc: 'Try drawing or journaling' },
      { icon: '🎵', title: 'Music Therapy', desc: 'Listen to uplifting tunes' },
      { icon: '🌳', title: 'Nature Walk', desc: 'Spend time outdoors' },
      { icon: '📚', title: 'Learn Something', desc: 'Explore a new topic' },
    ],
    accentColor: 'purple',
  },
  depression: {
    gradient: 'from-gray-600 via-slate-600 to-zinc-600',
    bgGradient: 'from-gray-100 via-slate-100 to-zinc-100',
    cardBg: 'from-white to-gray-50',
    emoji: '🌧️',
    title: 'Taking it one day at a time',
    subtitle: 'You\'re stronger than you know',
    message: 'Depression is tough, but you\'re not alone. Small steps forward are still progress. Be gentle with yourself.',
    activities: [
      { icon: '☀️', title: 'Sunlight', desc: '10 mins outside today' },
      { icon: '💧', title: 'Hydration', desc: 'Drink a glass of water' },
      { icon: '🛏️', title: 'Rest', desc: 'Allow yourself to rest' },
      { icon: '🤝', title: 'Reach Out', desc: 'Text a friend' },
    ],
    accentColor: 'gray',
  },
  suicidal: {
    gradient: 'from-rose-600 via-pink-600 to-red-600',
    bgGradient: 'from-rose-50 via-pink-50 to-red-50',
    cardBg: 'from-white to-rose-50',
    emoji: '🆘',
    title: 'You are not alone',
    subtitle: 'Your life has value and meaning',
    message: 'If you\'re having thoughts of self-harm, please reach out immediately. Crisis support: 988 (US) • Text HOME to 741741',
    activities: [
      { icon: '📞', title: 'Crisis Hotline', desc: 'Call 988 now' },
      { icon: '💬', title: 'Text Support', desc: 'Text HOME to 741741' },
      { icon: '❤️', title: 'Safe Person', desc: 'Call someone you trust' },
      { icon: '🏥', title: 'Emergency', desc: 'Go to ER if needed' },
    ],
    accentColor: 'rose',
  },
  anxiety: {
    gradient: 'from-sky-500 via-cyan-500 to-blue-500',
    bgGradient: 'from-sky-50 via-cyan-50 to-blue-50',
    cardBg: 'from-white to-sky-50',
    emoji: '🌊',
    title: 'Breathe and ground yourself',
    subtitle: 'This feeling will pass',
    message: 'Anxiety can feel overwhelming, but you have the power to calm your mind. Focus on what you can control right now.',
    activities: [
      { icon: '🫁', title: 'Deep Breathing', desc: '4-7-8 breathing technique' },
      { icon: '🧘', title: 'Meditation', desc: '5 mins of mindfulness' },
      { icon: '✍️', title: 'Worry Journal', desc: 'Write down your thoughts' },
      { icon: '🎧', title: 'Calm Sounds', desc: 'Listen to rain sounds' },
    ],
    accentColor: 'sky',
  },
  stress: {
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    bgGradient: 'from-amber-50 via-yellow-50 to-orange-50',
    cardBg: 'from-white to-amber-50',
    emoji: '⚡',
    title: 'Managing the pressure',
    subtitle: 'Break it down, step by step',
    message: 'Stress is your body\'s response to demands. Let\'s tackle things one at a time and find ways to decompress.',
    activities: [
      { icon: '📝', title: 'Task List', desc: 'Prioritize 3 things' },
      { icon: '🏃', title: 'Quick Exercise', desc: 'Move for 10 minutes' },
      { icon: '🛀', title: 'Self-Care', desc: 'Take a warm bath' },
      { icon: '📵', title: 'Digital Detox', desc: 'Phone-free hour' },
    ],
    accentColor: 'amber',
  },
  bipolar: {
    gradient: 'from-purple-600 via-violet-600 to-fuchsia-600',
    bgGradient: 'from-purple-50 via-violet-50 to-fuchsia-50',
    cardBg: 'from-white to-purple-50',
    emoji: '🌓',
    title: 'Finding your balance',
    subtitle: 'Navigating the highs and lows',
    message: 'Mood fluctuations can be challenging. Consistency in routine and support can help stabilize your emotional state.',
    activities: [
      { icon: '⏰', title: 'Sleep Schedule', desc: 'Same bedtime daily' },
      { icon: '📊', title: 'Mood Tracking', desc: 'Log your feelings' },
      { icon: '💊', title: 'Medication', desc: 'Take as prescribed' },
      { icon: '👨‍⚕️', title: 'Check-in', desc: 'Talk to your therapist' },
    ],
    accentColor: 'purple',
  },
  personality: {
    gradient: 'from-indigo-600 via-blue-600 to-purple-600',
    bgGradient: 'from-indigo-50 via-blue-50 to-purple-50',
    cardBg: 'from-white to-indigo-50',
    emoji: '🧩',
    title: 'Understanding yourself',
    subtitle: 'Growing through self-awareness',
    message: 'Building a stable sense of self takes time. You\'re on a journey of self-discovery and healing.',
    activities: [
      { icon: '🪞', title: 'Self-Reflection', desc: 'Journal your thoughts' },
      { icon: '🎯', title: 'Set Boundaries', desc: 'Practice saying no' },
      { icon: '💭', title: 'DBT Skills', desc: 'Mindfulness practice' },
      { icon: '👥', title: 'Support Group', desc: 'Connect with others' },
    ],
    accentColor: 'indigo',
  },
};

export default function MoodDashboard() {
  const { user, currentMood, setMoodDashboardCompleted } = useAuthStore();
  const [isAnimating, setIsAnimating] = useState(true);
  
  const theme = moodThemes[currentMood];

  useEffect(() => {
    setTimeout(() => setIsAnimating(false), 500);
  }, []);

  const handleContinue = () => {
    setMoodDashboardCompleted(true);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} overflow-y-auto`}>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header Card */}
        <div
          className={`bg-gradient-to-r ${theme.gradient} rounded-3xl shadow-2xl p-8 text-white transform transition-all duration-700 ${
            isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}! 👋</h1>
              <p className="text-white/90 text-lg">Here's how you're feeling based on your conversations</p>
            </div>
            <div className="text-8xl animate-float">{theme.emoji}</div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mt-6">
            <h2 className="text-3xl font-bold mb-2">{theme.title}</h2>
            <p className="text-xl text-white/90 mb-4">{theme.subtitle}</p>
            <p className="text-white/80 leading-relaxed">{theme.message}</p>
          </div>
        </div>

        {/* Mood Indicator */}
        <div
          className={`bg-gradient-to-br ${theme.cardBg} rounded-2xl shadow-xl p-6 transform transition-all duration-700 delay-100 ${
            isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <span className="text-3xl">{theme.emoji}</span>
            Current Mood: <span className={`text-${theme.accentColor}-600`}>{currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: '100%' }}
                ></div>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-600">Detected from your chats</span>
          </div>
        </div>

        {/* Recommended Activities */}
        <div
          className={`transform transition-all duration-700 delay-200 ${
            isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">💡 Recommended Activities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {theme.activities.map((activity, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${theme.cardBg} rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transform transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-${theme.accentColor}-300`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl animate-bounce" style={{ animationDelay: `${index * 200}ms`, animationDuration: '2s' }}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-800 mb-1">{activity.title}</h4>
                    <p className="text-gray-600 text-sm">{activity.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mood Stats Card */}
        <div
          className={`bg-gradient-to-br ${theme.cardBg} rounded-2xl shadow-xl p-6 transform transition-all duration-700 delay-300 ${
            isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">📊 Your Wellbeing Journey</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">💬</div>
              <div className="text-2xl font-bold text-gray-800">
                {localStorage.getItem(`chat_count_${user?.id}`) || '0'}
              </div>
              <div className="text-sm text-gray-600">Conversations</div>
            </div>
            <div className="bg-white/60 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-gray-800">Active</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
            <div className="bg-white/60 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">✨</div>
              <div className="text-2xl font-bold text-gray-800">Today</div>
              <div className="text-sm text-gray-600">Last Check-in</div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div
          className={`transform transition-all duration-700 delay-400 ${
            isAnimating ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <button
            onClick={handleContinue}
            className={`w-full bg-gradient-to-r ${theme.gradient} text-white font-bold py-6 px-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] text-xl flex items-center justify-center gap-3 animate-pulse-glow`}
            data-testid="continue-to-chat-btn"
          >
            Continue to Chat
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>

        {/* Emergency Notice for Suicidal Mood */}
        {currentMood === 'suicidal' && (
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🆘</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-red-800 mb-2">Immediate Support Available</h4>
                <p className="text-red-700 mb-3">
                  If you're having thoughts of self-harm or suicide, please reach out for help immediately:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">📞 US:</span>
                    <span>Call or text 988 (Suicide & Crisis Lifeline)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">💬 Text:</span>
                    <span>Text HOME to 741741 (Crisis Text Line)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">🌍 International:</span>
                    <span>Visit findahelpline.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
