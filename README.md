# 🧠 SoulSync - AI-Powered Mental Health Companion

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![Electron](https://img.shields.io/badge/Electron-28-blue)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-green)](https://fastapi.tiangolo.com/)

An empathetic, privacy-first mental health companion with AI-powered mood detection, daily check-ins, and **automatic crisis intervention** via Telegram alerts to emergency contacts.

## 🚀 Quick Start

**Get started in 5 minutes!** See [QUICKSTART.md](QUICKSTART.md) for step-by-step instructions.

**Full Documentation**: See [README_COMPREHENSIVE.md](README_COMPREHENSIVE.md) for complete system architecture, API docs, and detailed information.

## ✨ Key Features

### 🔐 Required Features (New!)
- **Telegram ID Registration** - Emergency contact required during signup
- **Daily Mood Dashboard** - Opens every time you launch the app
- **Mental Health Tips** - Animated carousel with wellness advice

### 💬 Core Features
- **AI-Powered Chat** - Empathetic conversations with mood detection
- **7 Mood Types** - UI adapts with unique themes (normal, depression, suicidal, anxiety, bipolar, stress, personality)
- **Crisis Detection** - Automatic Telegram alerts to emergency contacts when distress detected
- **Chat Management** - Full history with rename, delete, and export
- **Privacy-First** - Local data storage, optional backend integration

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.8+
- Telegram Bot Token

### Frontend Setup
```bash
cd electron-app
yarn install
```

### Backend Setup
```bash
# Your backend should already be running at:
http://127.0.0.1:8000

# Make sure it has the correct bot token configured
```

### Environment Configuration
```bash
# Already configured in electron-app/.env.local
NEXT_PUBLIC_BACKEND_API_URL=http://127.0.0.1:8000
```

## 🎯 Running the App

**Web Mode (Browser):**
```bash
cd electron-app
yarn dev:next
# Visit http://localhost:3000
```

**Desktop Mode (Electron):**
```bash
cd electron-app
yarn dev
```

## 📱 Getting Telegram ID

1. Open Telegram and search for `@userinfobot`
2. Forward any message to the bot
3. Bot replies with your chat ID
4. Use this ID during registration

## 🎨 New Features Added

### 1. Mood Dashboard (Every App Launch)
- Rate your day slider (1-10)
- Feelings scale slider (1-5)
- Rotating mental health tips with animations
- Fun, engaging visuals

### 2. Telegram ID Field (Required)
- Added to signup form
- Includes hint about @userinfobot
- Automatically registers emergency contact
- Connected to backend `/register_contact` API

### 3. Updated Flow
```
Login/Signup → Mood Dashboard → Chat Interface
     ↓              ↓                 ↓
  Telegram ID   Daily Check-in    AI Chat + Crisis Detection
```

## 🚨 Crisis Detection

When concerning patterns detected in chat:
1. Alert automatically triggered
2. Telegram message sent to emergency contact
3. Includes user info and detected condition
4. Emergency contact receives immediate notification

**Alert Format:**
```
⚠️ SoulSync Alert

User: John Doe (user_id)
Condition: suicidal

SoulSync detected possible distress in this user's messages.
This is an automated wellness check message.
```

## 📡 API Endpoints

- `POST /register_user` - Register new user
- `POST /register_contact` - Save Telegram emergency contact
- `POST /chat` - AI conversation with mood detection
- `POST /alert` - Send crisis notification (auto-triggered)

## 📁 Project Structure

```
/app/
├── electron-app/              # Desktop application
│   ├── components/
│   │   ├── EmailAuthScreen.tsx     # Login/signup with Telegram ID
│   │   ├── MoodDashboard.tsx       # Daily mood check-in (NEW!)
│   │   └── ChatDashboard.tsx       # Main chat interface
│   ├── lib/
│   │   ├── store.ts                # State management
│   │   └── api.ts                  # Backend API client
│   └── app/
│       └── page.tsx                # Main entry with flow control
└── backend/                   # FastAPI server (your location)
    └── telegram_api_server.py      # API with crisis detection
```

## 🛠️ Tech Stack

**Frontend:**
- Electron 28 (Desktop framework)
- Next.js 14 (React framework)
- TypeScript 5.3
- Tailwind CSS 3.4
- Zustand (State management)

**Backend:**
- FastAPI (Python)
- Telegram Bot API
- LLM Integration (Custom)

## 📚 Documentation

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md) - Get running in 5 minutes
- **Full Documentation**: [README_COMPREHENSIVE.md](README_COMPREHENSIVE.md) - Complete system details
- **API Docs**: Visit http://127.0.0.1:8000/docs when backend is running

## 🎯 User Flow

1. **Sign Up** - Email, password, name, username, **Telegram ID (required)**
2. **Mood Dashboard** - Rate day and feelings, view wellness tips
3. **Continue to Chat** - Access main chat interface
4. **AI Conversation** - Chat adapts to your emotional state
5. **Crisis Detection** - Automatic alerts if distress detected

## 🔒 Privacy & Security

- **Local Storage** - Chat history stays on your device
- **Minimal Data Sharing** - Only user ID and messages sent to backend
- **Alert Privacy** - Emergency contacts receive condition type, not message content
- **No Cloud Sync** - Complete control over your data

## 🆘 Mental Health Resources

**If you're in crisis, please contact:**
- **988 Suicide & Crisis Lifeline** (US): Call or text 988
- **Crisis Text Line** (International): Text HOME to 741741
- **Samaritans** (UK): 116 123

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Made with ❤️ for mental health awareness

---

**⚠️ Important**: This application is NOT a substitute for professional mental health care. Always seek help from qualified mental health professionals.
