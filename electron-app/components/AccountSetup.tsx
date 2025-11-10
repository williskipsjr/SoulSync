'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { backendAPI } from '@/lib/api';

export default function AccountSetup() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [telegramIds, setTelegramIds] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFakeMode = backendAPI.isFake();

  const addTelegramIdField = () => {
    setTelegramIds([...telegramIds, '']);
  };

  const removeTelegramIdField = (index: number) => {
    const newIds = telegramIds.filter((_, i) => i !== index);
    setTelegramIds(newIds.length > 0 ? newIds : ['']);
  };

  const updateTelegramId = (index: number, value: string) => {
    const newIds = [...telegramIds];
    newIds[index] = value;
    setTelegramIds(newIds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const validTelegramIds = telegramIds.filter(id => id.trim() !== '');
    if (validTelegramIds.length === 0) {
      setError('Please add at least one Telegram ID');
      return;
    }

    setLoading(true);

    try {
      const result = await backendAPI.registerContact({
        user_id: user?.id || '',
        user_name: name.trim(),
        contact_chatid: validTelegramIds[0], // Taking first telegram ID
      });

      if (result.success) {
        useAuthStore.getState().setSetupComplete(true);
      } else {
        setError(result.error || 'Failed to complete setup');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Account Setup</h1>
          <p className="text-gray-600 text-lg">
            Let's personalize your SoulSync experience
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {isFakeMode && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Demo Mode:</strong> Backend API not configured. Data will not be saved.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
                required
              />
            </div>

            {/* Telegram IDs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telegram IDs of Close Ones *
              </label>
              <p className="text-sm text-gray-500 mb-3">
                These contacts will be notified in case of distress
              </p>

              <div className="space-y-3">
                {telegramIds.map((id, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => updateTelegramId(index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="@username or telegram_id"
                    />
                    {telegramIds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTelegramIdField(index)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addTelegramIdField}
                className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Another Contact
              </button>
            </div>

            {/* Email (readonly) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold py-4 px-6 rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting up...
                </>
              ) : (
                'Complete Setup'
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🔒 Your information is secure and will only be used for emergency support purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
