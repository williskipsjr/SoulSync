'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { backendAPI, MoodType } from '@/lib/api';
import { supabaseHelper } from '@/lib/supabase';

const moodConfig = {
  anxiety: {
    gradient: 'from-teal-100 via-cyan-100 to-blue-100',
    textColor: 'text-teal-800',
    emoji: '😰',
    title: 'Taking a Deep Breath',
    message: "It's okay to feel anxious. Let's work through this together.",
    bgPattern: 'bg-teal-50/50',
  },
  depression: {
    gradient: 'from-gray-200 via-slate-200 to-zinc-200',
    textColor: 'text-gray-800',
    emoji: '😔',
    title: 'You Are Not Alone',
    message: "I am here to listen and support you through this difficult time.",
    bgPattern: 'bg-gray-100/50',
  },
  sad: {
    gradient: 'from-blue-100 via-indigo-100 to-purple-100',
    textColor: 'text-blue-800',
    emoji: '😢',
    title: 'Feeling Blue',
    message: "It's okay to feel sad. Your feelings are valid.",
    bgPattern: 'bg-blue-50/50',
  },
  happy: {
    gradient: 'from-yellow-100 via-orange-100 to-amber-100',
    textColor: 'text-orange-800',
    emoji: '😊',
    title: 'Wonderful to See You!',
    message: "I am so glad you are feeling good today! Let us keep the positive vibes flowing.",
    bgPattern: 'bg-yellow-50/50',
  },
  calm: {
    gradient: 'from-green-100 via-emerald-100 to-teal-100',
    textColor: 'text-green-800',
    emoji: '😌',
    title: 'Peace Within',
    message: "You are in a great place. Let us maintain this calm and centered feeling.",
    bgPattern: 'bg-green-50/50',
  },
  neutral: {
    gradient: 'from-purple-100 via-pink-100 to-rose-100',
    textColor: 'text-purple-800',
    emoji: '😐',
    title: 'Hello There',
    message: "How are you feeling today? I'm here to support you.",
    bgPattern: 'bg-purple-50/50',
  },
};

export default function LandingPage() {
  const { user } = useAuthStore();
  const [mood, setMood] = useState<MoodType>('neutral');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchMood = async () => {
      if (user?.id) {
        const moodData = await backendAPI.getMood(user.id);
        setMood(moodData.mood);
      }
      setLoading(false);
    };

    fetchMood();
  }, [user]);

  const handleLogout = async () => {
    await supabaseHelper.signOut();
    useAuthStore.getState().logout();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage) return;

    const userMessage = message.trim();
    setMessage('');
    setSendingMessage(true);

    // Add user message to chat
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await backendAPI.sendChat({
        user_id: user?.id || '',
        message: userMessage,
      });

      // Add assistant response to chat
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Checking your mood...</p>
        </div>
      </div>
    );
  }

  const config = moodConfig[mood];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} transition-all duration-1000`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">SoulSync</h1>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white/80 hover:bg-white text-gray-700 rounded-lg shadow-md transition-all"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!showChat ? (
          <div className="max-w-4xl mx-auto">
            {/* Mood Display */}
            <div className={`${config.bgPattern} backdrop-blur-sm rounded-3xl shadow-2xl p-12 text-center border border-white/50`}>
              <div className="text-9xl mb-6 animate-bounce">{config.emoji}</div>
              <h2 className={`text-5xl font-bold ${config.textColor} mb-4`}>{config.title}</h2>
              <p className={`text-xl ${config.textColor} mb-8 opacity-90`}>{config.message}</p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => setShowChat(true)}
                  className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  💬 Start Chatting
                </button>
                <button
                  className="px-8 py-4 bg-white/50 text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  📊 View Mood History
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">🧘</div>
                <h3 className="font-semibold text-gray-800 mb-2">Breathing Exercise</h3>
                <p className="text-gray-600 text-sm">Take a moment to practice deep breathing</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="font-semibold text-gray-800 mb-2">Journal</h3>
                <p className="text-gray-600 text-sm">Write down your thoughts and feelings</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-semibold text-gray-800 mb-2">Relaxing Music</h3>
                <p className="text-gray-600 text-sm">Listen to calming sounds</p>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              {/* Chat Header */}
              <div className={`bg-gradient-to-r ${config.gradient} p-4 flex items-center justify-between border-b`}>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className={`text-xl font-semibold ${config.textColor}`}>Chat with SoulSync</h3>
                <div className="w-10"></div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ height: 'calc(100% - 140px)' }}>
                {chatHistory.length === 0 && (
                  <div className="text-center text-gray-400 mt-20">
                    <p>Start a conversation...</p>
                  </div>
                )}
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sendingMessage && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={sendingMessage}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !message.trim()}
                    className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
