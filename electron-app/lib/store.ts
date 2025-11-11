import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MoodType } from './api';

interface LocalUser {
  id: string;
  email: string;
  name: string;
  username: string;
  telegram_id?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

interface AuthState {
  user: LocalUser | null;
  isAuthenticated: boolean;
  isSetupComplete: boolean;
  moodDashboardCompleted: boolean;
  currentMood: MoodType;
  chatSessions: ChatSession[];
  currentSessionId: string | null;
  setUser: (user: LocalUser | null) => void;
  setSetupComplete: (complete: boolean) => void;
  setMoodDashboardCompleted: (completed: boolean) => void;
  setMood: (mood: MoodType) => void;
  logout: () => void;
  // Chat session methods
  createNewSession: () => string;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, content: string) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  setCurrentSession: (sessionId: string | null) => void;
  getCurrentSession: () => ChatSession | null;
  exportSession: (sessionId: string) => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isSetupComplete: false,
      moodDashboardCompleted: false,
      currentMood: 'normal' as MoodType,
      chatSessions: [],
      currentSessionId: null,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isSetupComplete: !!user 
      }),
      
      setSetupComplete: (complete) => set({ isSetupComplete: complete }),
      
      setMoodDashboardCompleted: (completed) => set({ moodDashboardCompleted: completed }),
      
      setMood: (mood) => set({ currentMood: mood }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        isSetupComplete: false,
        moodDashboardCompleted: false,
        chatSessions: [],
        currentSessionId: null,
        currentMood: 'normal' as MoodType
      }),
      
      createNewSession: () => {
        const newSession: ChatSession = {
          id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          chatSessions: [newSession, ...state.chatSessions],
          currentSessionId: newSession.id,
        }));
        return newSession.id;
      },
      
      addMessage: (sessionId, message) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((session) => {
            if (session.id === sessionId) {
              const updatedMessages = [...session.messages, message];
              // Auto-generate title from first user message
              const title = session.messages.length === 0 && message.role === 'user'
                ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                : session.title;
              return {
                ...session,
                messages: updatedMessages,
                title,
                updatedAt: Date.now(),
              };
            }
            return session;
          }),
        }));
      },
      
      deleteSession: (sessionId) => {
        set((state) => ({
          chatSessions: state.chatSessions.filter((s) => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
        }));
      },
      
      renameSession: (sessionId, title) => {
        set((state) => ({
          chatSessions: state.chatSessions.map((session) =>
            session.id === sessionId
              ? { ...session, title, updatedAt: Date.now() }
              : session
          ),
        }));
      },
      
      setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),
      
      getCurrentSession: () => {
        const state = get();
        return state.chatSessions.find((s) => s.id === state.currentSessionId) || null;
      },
      
      exportSession: (sessionId) => {
        const state = get();
        const session = state.chatSessions.find((s) => s.id === sessionId);
        if (!session) return '';
        
        const exportData = {
          title: session.title,
          createdAt: new Date(session.createdAt).toISOString(),
          messages: session.messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp).toISOString(),
          })),
        };
        
        return JSON.stringify(exportData, null, 2);
      },
    }),
    {
      name: 'soulsync-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isSetupComplete: state.isSetupComplete,
        moodDashboardCompleted: state.moodDashboardCompleted,
        chatSessions: state.chatSessions,
        currentSessionId: state.currentSessionId,
        currentMood: state.currentMood,
      }),
    }
  )
);
