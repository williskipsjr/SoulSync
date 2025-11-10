import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import '@/App.css';
import LandingPage from '@/components/LandingPage';
import ChatInterface from '@/components/ChatInterface';
import ModeratorDashboard from '@/components/ModeratorDashboard';
import ProfileSettings from '@/components/ProfileSettings';
import { Toaster } from '@/components/ui/sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              token && user ? 
                <Navigate to="/chat" replace /> : 
                <LandingPage onLogin={login} />
            } 
          />
          <Route 
            path="/chat" 
            element={
              token && user ? 
                <ChatInterface token={token} user={user} onLogout={logout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              token && user ? 
                <ProfileSettings token={token} user={user} onLogout={logout} onUserUpdate={setUser} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/moderator" 
            element={<ModeratorDashboard />} 
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;