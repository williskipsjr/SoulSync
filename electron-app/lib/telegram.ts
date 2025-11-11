import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '5911086963:AAEJnmtGFfGAOCDlkNf5ymQCIUw3Qpq3_XU';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface TelegramAlertData {
  userName: string;
  userEmail: string;
  mood: string;
  message?: string;
}

class TelegramService {
  /**
   * Send crisis alert to emergency contact
   */
  async sendCrisisAlert(chatId: string, data: TelegramAlertData): Promise<boolean> {
    try {
      const alertMessage = this.formatCrisisAlert(data);
      
      const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
        chat_id: chatId,
        text: alertMessage,
        parse_mode: 'HTML',
      });

      if (response.data.ok) {
        console.log('✅ Telegram alert sent successfully');
        return true;
      } else {
        console.error('❌ Telegram API error:', response.data);
        return false;
      }
    } catch (error: any) {
      console.error('❌ Failed to send Telegram alert:', error.message);
      return false;
    }
  }

  /**
   * Format crisis alert message
   */
  private formatCrisisAlert(data: TelegramAlertData): string {
    const timestamp = new Date().toLocaleString();
    const moodEmojis: Record<string, string> = {
      suicidal: '🆘',
      depression: '😔',
      anxiety: '😰',
      stress: '😥',
      bipolar: '🌀',
      personality: '🧩',
    };

    const emoji = moodEmojis[data.mood] || '⚠️';

    // If custom message provided, use it as the main message
    const mainMessage = data.message || this.getMoodSpecificMessage(data.mood);

    return `
${emoji} <b>SoulSync Alert</b> ${emoji}

${mainMessage}

<b>User:</b> ${data.userName}
<b>Detected State:</b> ${data.mood.charAt(0).toUpperCase() + data.mood.slice(1)}
<b>Time:</b> ${timestamp}

<b>What you can do:</b>
${this.getRecommendedActions(data.mood)}

---
<i>Automated message from SoulSync - AI Mental Health Companion</i>
    `.trim();
  }

  /**
   * Get mood-specific message
   */
  private getMoodSpecificMessage(mood: string): string {
    const messages: Record<string, string> = {
      suicidal: '🚨 <b>URGENT:</b> The user may be experiencing thoughts of self-harm or suicide. Please reach out to them immediately and consider contacting emergency services if needed.',
      depression: '⚠️ The user appears to be experiencing symptoms of depression. They may benefit from your support and understanding at this time.',
      anxiety: '⚠️ The user is showing signs of severe anxiety. Your reassurance and support could be very helpful right now.',
      stress: '⚠️ The user seems to be under significant stress. A caring check-in could make a positive difference.',
      bipolar: '⚠️ The user may be experiencing mood fluctuations. Your stable support could be beneficial.',
      personality: '⚠️ The user appears to be working through identity and relationship concerns. Your understanding could help.',
    };

    return messages[mood] || '⚠️ The user may need emotional support at this time.';
  }

  /**
   * Get recommended actions based on mood
   */
  private getRecommendedActions(mood: string): string {
    if (mood === 'suicidal') {
      return `
• Call or text them immediately
• If they're in immediate danger, call emergency services (911)
• Encourage them to contact: 988 (Suicide & Crisis Lifeline)
• Stay with them until help arrives if possible
• Remove access to means of self-harm`;
    }

    return `
• Reach out with a caring message or call
• Listen without judgment
• Encourage them to seek professional help
• Check in regularly over the next few days
• Remind them you're there for support`;
  }

  /**
   * Test if Telegram bot is working
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${TELEGRAM_API_URL}/getMe`);
      if (response.data.ok) {
        console.log('✅ Telegram bot connected:', response.data.result.username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Telegram bot connection failed:', error);
      return false;
    }
  }
}

export const telegramService = new TelegramService();
