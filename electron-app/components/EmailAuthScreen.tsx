'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { backendAPI } from '@/lib/api';

export default function EmailAuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login logic - for now we'll use localStorage to validate
        const storedUsers = JSON.parse(localStorage.getItem('soulsync_users') || '[]');
        const user = storedUsers.find(
          (u: any) => u.email === formData.email && u.password === formData.password
        );

        if (user) {
          useAuthStore.getState().setUser({
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
          });
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Registration logic
        if (!formData.name || !formData.username || !formData.email || !formData.password) {
          setError('All fields are required');
          setLoading(false);
          return;
        }

        // Generate user ID
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store user locally
        const storedUsers = JSON.parse(localStorage.getItem('soulsync_users') || '[]');
        
        // Check if email already exists
        if (storedUsers.some((u: any) => u.email === formData.email)) {
          setError('Email already registered');
          setLoading(false);
          return;
        }

        const newUser = {
          id: userId,
          email: formData.email,
          password: formData.password,
          name: formData.name,
          username: formData.username,
        };

        storedUsers.push(newUser);
        localStorage.setItem('soulsync_users', JSON.stringify(storedUsers));

        // Register with backend
        const result = await backendAPI.registerUser({
          user_id: userId,
          username: formData.username,
          name: formData.name,
          email: formData.email,
        });

        if (result.success) {
          useAuthStore.getState().setUser({
            id: userId,
            email: formData.email,
            name: formData.name,
            username: formData.username,
          });
        } else {
          setError(result.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SoulSync</h1>
          <p className="text-gray-600 text-lg">Your Empathetic AI Mental Health Companion</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/50">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="johndoe"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Login' : 'Create Account'
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Need help? Contact support@soulsync.com
        </p>
      </div>
    </div>
  );
}
