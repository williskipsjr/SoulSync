'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { supabaseHelper } from '@/lib/supabase';
import LoginScreen from '@/components/LoginScreen';
import AccountSetup from '@/components/AccountSetup';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const { user, isAuthenticated, isSetupComplete } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const currentUser = await supabaseHelper.getCurrentUser();
      if (currentUser) {
        useAuthStore.getState().setUser(currentUser);
        // TODO: Check if setup is complete from backend
        // For now, assume if user exists, setup might be needed
      }
      setLoading(false);
    };

    checkUser();

    // Listen for auth state changes
    const unsubscribe = supabaseHelper.onAuthStateChange((user) => {
      useAuthStore.getState().setUser(user);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading SoulSync...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Show account setup if authenticated but setup not complete
  if (!isSetupComplete) {
    return <AccountSetup />;
  }

  // Show main landing page with mood-based UI
  return <LandingPage />;
}
