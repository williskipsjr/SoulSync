import axios, { AxiosInstance } from 'axios';

type MoodType = 'anxiety' | 'depression' | 'sad' | 'happy' | 'calm' | 'neutral';

interface SetupData {
  name: string;
  tgids: string[];
  userid: string;
  email: string;
}

interface ChatMessage {
  user_id: string;
  message: string;
}

interface MoodResponse {
  mood: MoodType;
  message?: string;
}

class BackendAPI {
  private client: AxiosInstance | null = null;
  private isFakeMode: boolean = false;
  private baseURL: string = '';

  constructor() {
    const backendURL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

    if (backendURL) {
      // Real API mode
      this.baseURL = backendURL;
      this.client = axios.create({
        baseURL: backendURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.isFakeMode = false;
      console.log(`✅ Backend API: Real mode - ${backendURL}`);
    } else {
      // Fake mode
      this.isFakeMode = true;
      console.log('⚠️ Backend API: Fake mode (no backend URL provided)');
    }
  }

  async setupUser(data: SetupData): Promise<{ success: boolean; error?: string }> {
    if (this.isFakeMode) {
      console.log('📝 [FAKE] User setup:', data);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    }

    try {
      const response = await this.client!.post('/setup', data);
      return { success: true };
    } catch (error: any) {
      console.error('Setup user error:', error);
      return { success: false, error: error.message };
    }
  }

  async getMood(userId: string): Promise<MoodResponse> {
    if (this.isFakeMode) {
      // Return random mood for demo
      const moods: MoodType[] = ['anxiety', 'depression', 'sad', 'happy', 'calm', 'neutral'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      console.log(`😊 [FAKE] Mood check for ${userId}:`, randomMood);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { mood: randomMood, message: 'Fake mood data' };
    }

    try {
      const response = await this.client!.get(`/mood/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Get mood error:', error);
      return { mood: 'neutral', message: 'Error fetching mood' };
    }
  }

  async sendChat(data: ChatMessage): Promise<{ response: string; error?: string }> {
    if (this.isFakeMode) {
      console.log('💬 [FAKE] Chat message:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { 
        response: 'This is a fake response. Please configure NEXT_PUBLIC_BACKEND_API_URL to connect to real backend.' 
      };
    }

    try {
      const response = await this.client!.post('/chat', data);
      return { response: response.data };
    } catch (error: any) {
      console.error('Chat error:', error);
      return { response: '', error: error.message };
    }
  }

  isFake(): boolean {
    return this.isFakeMode;
  }

  getBaseURL(): string {
    return this.baseURL;
  }
}

export const backendAPI = new BackendAPI();
export type { MoodType, SetupData, ChatMessage, MoodResponse };
