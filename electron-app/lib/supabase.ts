import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

class SupabaseHelper {
  private client: SupabaseClient | null = null;
  private isFakeMode: boolean = false;
  private fakeUser: User | null = null;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      // Real Supabase mode
      this.client = createClient(supabaseUrl, supabaseAnonKey);
      this.isFakeMode = false;
      console.log('✅ Supabase: Real authentication mode');
    } else {
      // Fake mode
      this.isFakeMode = true;
      console.log('⚠️ Supabase: Fake authentication mode (no credentials provided)');
    }
  }

  async signInWithGoogle(): Promise<{ user: User | null; error: any }> {
    if (this.isFakeMode) {
      // Return fake user data
      const fakeUser: any = {
        id: 'fake-user-' + Date.now(),
        email: 'fakeuser@example.com',
        user_metadata: {
          full_name: 'Fake User',
          avatar_url: 'https://via.placeholder.com/150',
        },
        created_at: new Date().toISOString(),
      };
      this.fakeUser = fakeUser;
      return { user: fakeUser, error: null };
    }

    try {
      const { data, error } = await this.client!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });

      if (error) throw error;

      // Get the session after OAuth redirect
      const { data: sessionData } = await this.client!.auth.getSession();
      return { user: sessionData.session?.user || null, error: null };
    } catch (error) {
      console.error('Google sign-in error:', error);
      return { user: null, error };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.isFakeMode) {
      return this.fakeUser;
    }

    try {
      const { data: { user } } = await this.client!.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    if (this.isFakeMode) {
      this.fakeUser = null;
      return;
    }

    try {
      await this.client!.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  onAuthStateChange(callback: (user: User | null) => void): (() => void) | null {
    if (this.isFakeMode) {
      // Call callback with fake user immediately
      callback(this.fakeUser);
      return null;
    }

    const { data: { subscription } } = this.client!.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }

  isFake(): boolean {
    return this.isFakeMode;
  }
}

export const supabaseHelper = new SupabaseHelper();
