'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { backendAPI, MoodType } from '@/lib/api';

const moodConfig = {
  normal: {
    gradient: 'from-indigo-100 via-purple-50 to-pink-100',
    sidebarBg: 'bg-indigo-50/50',
    textColor: 'text-indigo-800',
    buttonColor: 'bg-indigo-500 hover:bg-indigo-600',
    emoji: '😊',
    title: 'How are you feeling today?',
    message: "I'm here to listen and support you.",
  },
  depression: {
    gradient: 'from-gray-100 via-slate-100 to-zinc-100',
    sidebarBg: 'bg-gray-50/50',
    textColor: 'text-gray-700',
    buttonColor: 'bg-gray-500 hover:bg-gray-600',
    emoji: '😔',
    title: 'You are not alone',
    message: "I'm here to support you through this difficult time.",
  },
  suicidal: {
    gradient: 'from-rose-100 via-pink-100 to-red-100',
    sidebarBg: 'bg-rose-50/50',
    textColor: 'text-rose-800',
    buttonColor: 'bg-rose-500 hover:bg-rose-600',
    emoji: '🌸',
    title: 'Please reach out',
    message: "You matter. Let's talk about what you're feeling.",
  },
  anxiety: {
    gradient: 'from-sky-100 via-cyan-100 to-blue-100',
    sidebarBg: 'bg-sky-50/50',
    textColor: 'text-sky-800',
    buttonColor: 'bg-sky-500 hover:bg-sky-600',
    emoji: '😰',
    title: 'Take a deep breath',
    message: "Let's work through this together, one step at a time.",
  },
  bipolar: {
    gradient: 'from-purple-100 via-violet-100 to-fuchsia-100',
    sidebarBg: 'bg-purple-50/50',
    textColor: 'text-purple-800',
    buttonColor: 'bg-purple-500 hover:bg-purple-600',
    emoji: '🌀',
    title: 'Finding balance',
    message: "I'm here to help you navigate your feelings.",
  },
  stress: {
    gradient: 'from-amber-100 via-yellow-100 to-orange-100',
    sidebarBg: 'bg-amber-50/50',
    textColor: 'text-amber-800',
    buttonColor: 'bg-amber-500 hover:bg-amber-600',
    emoji: '😥',
    title: "Let's ease the pressure",
    message: "Together we can find ways to manage what you're feeling.",
  },
  personality: {
    gradient: 'from-indigo-100 via-blue-100 to-purple-100',
    sidebarBg: 'bg-indigo-50/50',
    textColor: 'text-indigo-800',
    buttonColor: 'bg-indigo-500 hover:bg-indigo-600',
    emoji: '🧠',
    title: 'Understanding yourself',
    message: "Let's explore your thoughts and feelings together.",
  },
};

export default function ChatDashboard() {
  const { user, currentMood, setMood, logout } = useAuthStore();
  const {
    chatSessions,
    currentSessionId,
    createNewSession,
    addMessage,
    deleteSession,
    renameSession,
    setCurrentSession,
    getCurrentSession,
    exportSession,
  } = useAuthStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMood, setLoadingMood] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [alertNotification, setAlertNotification] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = getCurrentSession();
  const config = moodConfig[currentMood];

  useEffect(() => {
    // Fetch mood on mount
    const fetchMood = async () => {
      if (user?.id) {
        const moodData = await backendAPI.getMood(user.id);
        setMood(moodData.mood);
      }
      setLoadingMood(false);
    };
    fetchMood();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleNewChat = () => {
    const newSessionId = createNewSession();
    setCurrentSession(newSessionId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendingMessage || !currentSessionId) return;

    const userMessage = message.trim();
    setMessage('');
    setSendingMessage(true);

    // Add user message
    const userMsgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    addMessage(currentSessionId, {
      id: userMsgId,
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    });

    try {
      const response = await backendAPI.sendChat({
        user_id: user?.id || '',
        message: userMessage,
      });

      // Update mood if provided
      if (response.mood) {
        setMood(response.mood);
      }

      // Show alert notification if alert was sent
      if (response.alert_sent) {
        setAlertNotification('Emergency contact has been notified about your wellbeing.');
        setTimeout(() => setAlertNotification(null), 8000);
      }

      // Add assistant response
      const assistantMsgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addMessage(currentSessionId, {
        id: assistantMsgId,
        role: 'assistant',
        content: response.response,
        timestamp: Date.now(),
      });
    } catch (error: any) {
      // Add error message
      const errorMsgId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      addMessage(currentSessionId, {
        id: errorMsgId,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      deleteSession(sessionId);
    }
  };

  const handleRenameSession = (sessionId: string, currentTitle: string) => {
    setEditingSessionId(sessionId);
    setEditTitle(currentTitle);
  };

  const saveRename = (sessionId: string) => {
    if (editTitle.trim()) {
      renameSession(sessionId, editTitle.trim());
    }
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleExportSession = (sessionId: string) => {
    const data = exportSession(sessionId);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `soulsync-chat-${sessionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loadingMood) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Detecting your mood...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen max-h-screen bg-gradient-to-br ${config.gradient} transition-all duration-1000 overflow-hidden`}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-80' : 'w-0'} ${config.sidebarBg} backdrop-blur-sm border-r border-white/30 transition-all duration-300 overflow-hidden flex flex-col h-screen`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">SoulSync</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              data-testid="close-sidebar-btn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <button
            onClick={handleNewChat}
            className={`w-full ${config.buttonColor} text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2`}
            data-testid="new-chat-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Chat History</h3>
          {chatSessions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No chats yet</p>
          ) : (
            chatSessions.map((session) => (
              <div
                key={session.id}
                className={`group p-3 rounded-lg cursor-pointer transition-all ${
                  currentSessionId === session.id
                    ? 'bg-white shadow-md'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                onClick={() => setCurrentSession(session.id)}
                data-testid={`chat-session-${session.id}`}
              >
                {editingSessionId === session.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveRename(session.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(session.id);
                      if (e.key === 'Escape') setEditingSessionId(null);
                    }}
                    className="w-full px-2 py-1 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-800 truncate flex-1">
                        {session.title}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameSession(session.id, session.title);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Rename"
                          data-testid={`rename-chat-${session.id}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportSession(session.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title="Export"
                          data-testid={`export-chat-${session.id}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="p-1 hover:bg-red-200 rounded"
                          title="Delete"
                          data-testid={`delete-chat-${session.id}`}
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-white/50 rounded transition-colors"
              title="Logout"
              data-testid="logout-btn"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Alert Notification */}
        {alertNotification && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-rose-500 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-pulse">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-semibold">{alertNotification}</span>
          </div>
        )}
        
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-white/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-white rounded-lg transition-colors"
                data-testid="open-sidebar-btn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">{config.title}</h1>
              <p className="text-sm text-gray-600">{config.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-4xl">{config.emoji}</div>
            <span className={`text-sm font-semibold ${config.textColor} px-3 py-1 rounded-full bg-white/50`}>
              {currentMood.charAt(0).toUpperCase() + currentMood.slice(1)}
            </span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6" data-testid="messages-area">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">{config.emoji}</div>
              <h2 className={`text-2xl font-bold ${config.textColor} mb-2`}>{config.title}</h2>
              <p className="text-gray-600 max-w-md">{config.message}</p>
              <p className="text-sm text-gray-500 mt-4">Start a conversation by typing a message below.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {currentSession.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${msg.role}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                        : 'bg-white/80 backdrop-blur-sm text-gray-800 shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              {sendingMessage && (
                <div className="flex justify-start" data-testid="typing-indicator">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white/80 backdrop-blur-sm border-t border-white/30 p-4">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                disabled={sendingMessage || !currentSessionId}
                data-testid="message-input"
              />
              <button
                type="submit"
                disabled={sendingMessage || !message.trim() || !currentSessionId}
                className={`${config.buttonColor} text-white px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                data-testid="send-message-btn"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {!currentSessionId && (
              <p className="text-sm text-gray-500 mt-2 text-center">Click "New Chat" to start a conversation</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
