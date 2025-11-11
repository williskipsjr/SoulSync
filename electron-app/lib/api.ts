import axios, { AxiosInstance } from 'axios';
import { telegramService } from './telegram';

type MoodType = 'normal' | 'depression' | 'suicidal' | 'anxiety' | 'bipolar' | 'stress' | 'personality';

interface UserRegistration {
  user_id: string;
  username: string;
  name: string;
  email: string;
}

interface ContactRequest {
  user_id: string;
  user_name: string;
  contact_chatid: string;
}

interface ChatMessage {
  user_id: string;
  message: string;
}

interface ChatResponse {
  response: string;
  mood?: MoodType;
  alert_sent?: boolean;
}

interface MoodResponse {
  mood: MoodType;
  message?: string;
}

class BackendAPI {
  private ollamaClient: AxiosInstance;

  constructor() {
    // Initialize Ollama API client
    this.ollamaClient = axios.create({
      baseURL: 'http://localhost:11434',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('✅ AI Mode: Local Ollama with Llama 2');
  }

  async registerUser(data: UserRegistration): Promise<{ success: boolean; message?: string; error?: string }> {
    console.log('📝 [FAKE] User registration:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'User registered successfully!' };
  }

  async registerContact(data: ContactRequest): Promise<{ success: boolean; message?: string; error?: string }> {
    console.log('📝 [FAKE] Contact registration:', data);
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Emergency contact registered!' };
  }

  async getMood(userId: string): Promise<MoodResponse> {
    // Get mood from localStorage based on recent conversations
    const storedMood = localStorage.getItem(`mood_${userId}`);
    if (storedMood) {
      return { mood: storedMood as MoodType, message: 'Mood detected from recent conversations' };
    }
    return { mood: 'normal', message: 'Start chatting to detect your mood' };
  }

  private detectMoodFromText(text: string): MoodType {
    const lowerText = text.toLowerCase();
    
    // Suicidal indicators
    if (lowerText.match(/suicid|kill myself|end it all|want to die|no reason to live|better off dead/i)) {
      return 'suicidal';
    }
    
    // Depression indicators
    if (lowerText.match(/depress|hopeless|worthless|empty|numb|can't feel|no energy|don't care anymore/i)) {
      return 'depression';
    }
    
    // Anxiety indicators
    if (lowerText.match(/anxious|panic|worry|scared|terrified|can't breathe|heart racing|nervous/i)) {
      return 'anxiety';
    }
    
    // Stress indicators
    if (lowerText.match(/stress|overwhelm|pressure|too much|can't handle|burnout|exhausted/i)) {
      return 'stress';
    }
    
    // Bipolar indicators
    if (lowerText.match(/manic|mood swing|high and low|can't sleep|racing thoughts|impulsive/i)) {
      return 'bipolar';
    }
    
    // Personality disorder indicators
    if (lowerText.match(/unstable|identity|who am i|don't know myself|relationship problems|abandonment/i)) {
      return 'personality';
    }
    
    return 'normal';
  }

  /**
   * Extract mood label from response
   * Format: {{MoodLabel}}
   */
  private extractMoodLabel(text: string): { cleanText: string; mood: MoodType } {
    const moodRegex = /\{\{(Normal|Depression|Suicidal|Anxiety|Bipolar|Stress|Personality disorder)\}\}/i;
    const match = text.match(moodRegex);
    
    if (match) {
      const cleanText = text.replace(moodRegex, '').trim();
      const moodLabel = match[1].toLowerCase().replace(' disorder', '');
      
      // Map to MoodType
      const moodMap: Record<string, MoodType> = {
        'normal': 'normal',
        'depression': 'depression',
        'suicidal': 'suicidal',
        'anxiety': 'anxiety',
        'bipolar': 'bipolar',
        'stress': 'stress',
        'personality': 'personality'
      };
      
      return {
        cleanText,
        mood: moodMap[moodLabel] || 'normal'
      };
    }
    
    // Fallback: detect from user message if no label found
    return {
      cleanText: text,
      mood: 'normal'
    };
  }

  /**
   * Generate personalized alert message using Ollama
   */
  private async generateAlertMessage(userName: string, mood: MoodType): Promise<string> {
    try {
      const prompt = `Generate a caring, natural message to send to ${userName}'s close friend via text. The message should inform them that ${userName} is experiencing ${mood} and needs support. Keep it warm, direct, and conversational (2-3 sentences). Don't use any special formatting or labels.`;
      
      const response = await this.ollamaClient.post('/api/chat', {
        model: 'llama2:latest',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 150,
        }
      });
      
      return response.data.message.content.trim();
    } catch (error) {
      console.error('Error generating alert message:', error);
      // Fallback message
      return `Hey, your friend ${userName} is not feeling well. They seem to be experiencing ${mood}. Please take some time to talk to them and offer your support.`;
    }
  }

  async sendChat(data: ChatMessage): Promise<ChatResponse> {
    console.log('💬 Sending message to Ollama (Llama 2):', data);
    
    try {
      // Detect mood from user message initially
      const initialMood = this.detectMoodFromText(data.message);
      
      // Create system prompt based on detected mood
      const systemPrompt = this.getSystemPromptForMood(initialMood);
      
      // Call Ollama API (non-streaming for now, will update to streaming)
      const response = await this.ollamaClient.post('/api/chat', {
        model: 'llama2:latest',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: data.message
          }
        ],
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500,
        }
      });
      
      const rawResponse = response.data.message.content;
      
      // Extract mood label from response
      const { cleanText, mood } = this.extractMoodLabel(rawResponse);
      
      // Save mood to localStorage
      if (mood !== 'normal') {
        localStorage.setItem(`mood_${data.user_id}`, mood);
      }

      // Check if we need to send crisis alert (any non-normal mood)
      let alertSent = false;
      if (mood !== 'normal') {
        alertSent = await this.sendCrisisAlert(data.user_id, mood);
      }
      
      return {
        response: cleanText,
        mood: mood,
        alert_sent: alertSent
      };
    } catch (error: any) {
      console.error('Ollama API error:', error);
      
      // Fallback to empathetic responses
      const detectedMood = this.detectMoodFromText(data.message);
      if (detectedMood !== 'normal') {
        localStorage.setItem(`mood_${data.user_id}`, detectedMood);
      }

      // Still try to send alert even with API error
      let alertSent = false;
      if (detectedMood !== 'normal') {
        alertSent = await this.sendCrisisAlert(data.user_id, detectedMood);
      }
      
      return {
        response: this.getFallbackResponse(detectedMood),
        mood: detectedMood,
        alert_sent: alertSent
      };
    }
  }

  /**
   * Send chat with streaming support
   */
  async sendChatStream(
    data: ChatMessage,
    onChunk: (chunk: string) => void,
    onComplete: (mood: MoodType, alertSent: boolean) => void
  ): Promise<void> {
    console.log('💬 Sending message to Ollama (Streaming):', data);
    
    try {
      // Detect mood from user message initially
      const initialMood = this.detectMoodFromText(data.message);
      
      // Create system prompt based on detected mood
      const systemPrompt = this.getSystemPromptForMood(initialMood);
      
      // Call Ollama API with streaming
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2:latest',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: data.message
            }
          ],
          stream: true,
          options: {
            temperature: 0.7,
            num_predict: 500,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                const content = parsed.message.content;
                fullResponse += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      // Extract mood label from complete response
      const { cleanText, mood } = this.extractMoodLabel(fullResponse);
      
      // Save mood to localStorage
      if (mood !== 'normal') {
        localStorage.setItem(`mood_${data.user_id}`, mood);
      }

      // Send crisis alert if needed
      let alertSent = false;
      if (mood !== 'normal') {
        alertSent = await this.sendCrisisAlert(data.user_id, mood);
      }

      onComplete(mood, alertSent);
      
    } catch (error: any) {
      console.error('Ollama streaming error:', error);
      
      // Fallback response
      const detectedMood = this.detectMoodFromText(data.message);
      const fallbackText = this.getFallbackResponse(detectedMood);
      
      onChunk(fallbackText);
      
      if (detectedMood !== 'normal') {
        localStorage.setItem(`mood_${data.user_id}`, detectedMood);
        await this.sendCrisisAlert(data.user_id, detectedMood);
      }
      
      onComplete(detectedMood, detectedMood !== 'normal');
    }
  }

  /**
   * Send crisis alert to emergency contact via Telegram
   */
  private async sendCrisisAlert(userId: string, mood: MoodType): Promise<boolean> {
    try {
      // Get user data from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('soulsync_users') || '[]');
      const user = storedUsers.find((u: any) => u.id === userId);

      if (!user || !user.telegram_id) {
        console.warn('⚠️ No emergency contact found for user');
        return false;
      }

      // Check if we've already sent an alert recently (avoid spam)
      const lastAlertKey = `last_alert_${userId}`;
      const lastAlert = localStorage.getItem(lastAlertKey);
      const now = Date.now();
      
      if (lastAlert) {
        const timeSinceLastAlert = now - parseInt(lastAlert);
        // Don't send another alert within 1 hour
        if (timeSinceLastAlert < 3600000) {
          console.log('⏰ Alert cooldown active, skipping duplicate alert');
          return false;
        }
      }

      // Generate personalized alert message using Ollama
      const personalizedMessage = await this.generateAlertMessage(user.name, mood);

      // Send Telegram alert with personalized message
      const alertSent = await telegramService.sendCrisisAlert(user.telegram_id, {
        userName: user.name,
        userEmail: user.email,
        mood: mood,
        message: personalizedMessage,
      });

      if (alertSent) {
        // Update last alert timestamp
        localStorage.setItem(lastAlertKey, now.toString());
        console.log('✅ Crisis alert sent to emergency contact');
      }

      return alertSent;
    } catch (error) {
      console.error('❌ Error sending crisis alert:', error);
      return false;
    }
  }

  private getSystemPromptForMood(mood: MoodType): string {
    const baseInstruction = `You are SoulSync, an empathetic AI mental health companion. 

CRITICAL INSTRUCTIONS:
1. Keep ALL responses concise (2-4 sentences maximum)
2. ALWAYS end your response with a mood label in this exact format: {{MoodLabel}}
3. Choose ONE mood label from: Normal, Depression, Suicidal, Anxiety, Bipolar, Stress, Personality disorder
4. The label should reflect the user's emotional state based on their message
5. Example response format: "I hear you, and your feelings are valid. Let's work through this together. {{Depression}}"

`;

    const prompts = {
      normal: baseInstruction + "Be supportive, understanding, and provide thoughtful responses. Keep responses concise and caring.",
      depression: baseInstruction + "Support someone experiencing depression. Be gentle, validating, and remind them that their feelings are valid. Offer hope and suggest small, manageable steps. Never minimize their pain.",
      suicidal: baseInstruction + "Help someone in crisis. Be extremely compassionate and non-judgmental. Acknowledge their pain, emphasize that you care, and gently encourage them to reach out to crisis services. Remind them their life has value.",
      anxiety: baseInstruction + "Help someone with anxiety. Provide calming, grounding techniques. Validate their worries while helping them gain perspective. Suggest breathing exercises and mindfulness.",
      stress: baseInstruction + "Help someone manage stress. Be practical and supportive. Help them break down overwhelming situations into manageable parts. Suggest self-care activities.",
      bipolar: baseInstruction + "Support someone with mood fluctuations. Be steady and consistent. Help them recognize patterns and suggest routine maintenance. Encourage professional support.",
      personality: baseInstruction + "Help someone exploring their identity and relationships. Be patient and understanding. Help them develop self-awareness and healthy coping strategies."
    };
    
    return prompts[mood];
  }

  private getFallbackResponse(mood: MoodType): string {
    const responses = {
      normal: "I'm here to listen and support you. How are you feeling today? Please share what's on your mind.",
      depression: "I hear you, and your feelings are completely valid. Depression can make everything feel so heavy, but you're not alone in this. I'm here with you. What's weighing on your mind right now?",
      suicidal: "I'm so glad you're talking to me right now. Your life matters, and your pain is real. Please know that these feelings, as intense as they are, can change. Have you thought about reaching out to a crisis helpline? I'm here to listen without judgment.",
      anxiety: "I can sense you're feeling anxious right now. Let's take this one moment at a time. Try taking a slow, deep breath with me. What specific worry is most present for you right now?",
      stress: "It sounds like you're dealing with a lot right now. That feeling of being overwhelmed is exhausting. Let's try to break this down together. What's the one thing causing you the most stress?",
      bipolar: "I'm here to provide steady support as you navigate these mood changes. What you're experiencing is real, and it's okay. How are you feeling in this moment?",
      personality: "Understanding ourselves can be challenging, and it's brave that you're exploring this. Your feelings and experiences are valid. What's been on your mind lately?"
    };
    
    return responses[mood];
  }

  isFake(): boolean {
    return true; // Always fake mode now
  }

  getBaseURL(): string {
    return 'fake-mode';
  }
}

export const backendAPI = new BackendAPI();
export type { MoodType, UserRegistration, ContactRequest, ChatMessage, ChatResponse, MoodResponse };
